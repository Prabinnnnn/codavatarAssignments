from hashlib import sha256
import json

from fastapi.encoders import jsonable_encoder
from redis.exceptions import RedisError

from .redis_client import redis_client


CACHE_TTL_SECONDS = 60 #tells redis how long to keep in memory before deleting it
LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60
LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5

#versioning keys, instead of deleting thousands of keys when a blog changes, we just bump the version and the 
# old keys will be ignored and eventyally expire out of redis
BLOG_LIST_VERSION_KEY = "cache:blogs:list:version"
BLOG_DETAIL_VERSION_KEY_PREFIX = "cache:blogs:detail:version:" #by using prefix, we can target a specific blog posts version without affecting others
COMMENT_LIST_VERSION_KEY = "cache:comments:list:version"

#prefixes ensures that different types of data(blog content, banned tokens, etc) don't get mixed up in redis
#and also make it easier to manage and debug the cache by providing a clear structure to keys
#for example, all blog list cache keys start with "cache:blogs:list:", so we can easily identify them and manage them as a group if needed.
COMMENT_DETAIL_VERSION_KEY_PREFIX = "cache:comments:detail:version:"
AUTH_BLACKLIST_KEY_PREFIX = "auth:blacklist:"
LOGIN_RATE_LIMIT_KEY_PREFIX = "auth:login:rate_limit:"


##this is safety check to ensure that if redis is not available for any reason, our app can still function without caching 
def _redis_available() -> bool:
    return redis_client is not None

##this segregates cache by user, prevents one user form getting or seeing another users cahched data
def _user_bucket(current_user_id: int | None) -> str:
    return f"user:{current_user_id}" if current_user_id is not None else "anon"


def _token_key(token: str) -> str: #it hashes the raw jwt before using it as redis key, so token text is not stored directly in key names
    digest = sha256(token.encode("utf-8")).hexdigest()
    return f"{AUTH_BLACKLIST_KEY_PREFIX}{digest}"


def get_cached_payload(cache_key: str):
    if not _redis_available():
        return None

    try:
        cached_value = redis_client.get(cache_key)
    except RedisError:
        return None

    if cached_value is None:
        return None

    return json.loads(cached_value)


def set_cached_payload(cache_key: str, payload, ttl_seconds: int = CACHE_TTL_SECONDS) -> None:
    if not _redis_available():
        return

    try:
        redis_client.set(cache_key, json.dumps(jsonable_encoder(payload)), ex=ttl_seconds)
    except RedisError:
        return


def get_version(version_key: str) -> int:
    if not _redis_available():
        return 0

    try:
        version_value = redis_client.get(version_key)
    except RedisError:
        return 0

    if version_value is None:
        return 0

    try:
        return int(version_value)
    except ValueError:
        return 0


def bump_version(version_key: str) -> None:
    if not _redis_available():
        return

    try:
        redis_client.incr(version_key)
    except RedisError:
        return


#cache key generation functions, these create unique keys for different types of cached data, incorporating relevant parameters like user id, blog id, etc to 
#ensure that the cache is properly segmented and can be efficiently retrieved and invalidated when needed.
def blog_list_cache_key(skip: int, limit: int, current_user_id: int | None) -> str:
    return (
        f"blogs:list:v{get_version(BLOG_LIST_VERSION_KEY)}:"
        f"skip:{skip}:limit:{limit}:actor:{_user_bucket(current_user_id)}"
    )


def blog_detail_cache_key(blog_id: int, current_user_id: int | None) -> str:
    return (
        f"blogs:detail:v{get_version(f'{BLOG_DETAIL_VERSION_KEY_PREFIX}{blog_id}')}:"
        f"blog:{blog_id}:actor:{_user_bucket(current_user_id)}"
    )


def comment_list_cache_key(blog_id: int, current_user_id: int | None) -> str:
    return (
        f"comments:list:v{get_version(COMMENT_LIST_VERSION_KEY)}:"
        f"blog:{blog_id}:actor:{_user_bucket(current_user_id)}"
    )


def comment_detail_cache_key(comment_id: int, current_user_id: int | None) -> str:
    return (
        f"comments:detail:v{get_version(f'{COMMENT_DETAIL_VERSION_KEY_PREFIX}{comment_id}')}:"
        f"comment:{comment_id}:actor:{_user_bucket(current_user_id)}"
    )

#these are triggered when someone updates, deletes or creates content
#if we edit blog no 5, it bumps the global list version(so the homepage updates) and the specific version for blog 5
def invalidate_blog_cache(blog_id: int | None = None) -> None:
    bump_version(BLOG_LIST_VERSION_KEY)
    if blog_id is not None:
        bump_version(f"{BLOG_DETAIL_VERSION_KEY_PREFIX}{blog_id}")


def invalidate_comment_cache(comment_id: int | None = None) -> None:
    bump_version(COMMENT_LIST_VERSION_KEY)
    if comment_id is not None:
        bump_version(f"{COMMENT_DETAIL_VERSION_KEY_PREFIX}{comment_id}")


def is_token_blacklisted(token: str) -> bool: #done
    if not _redis_available():
        return False

    try:
        return redis_client.exists(_token_key(token)) == 1
    except RedisError:
        return False


def blacklist_token(token: str, ttl_seconds: int) -> None: #done
    if not _redis_available() or ttl_seconds <= 0:
        return

    try:
        redis_client.set(_token_key(token), "1", ex=ttl_seconds)
    except RedisError:
        return


def rate_limit_login_attempt(ip_address: str) -> None: #done
    if not _redis_available():
        return

    cache_key = f"{LOGIN_RATE_LIMIT_KEY_PREFIX}{ip_address}" #this creates uniue it for users internet connection

    try:
        attempt_count = redis_client.incr(cache_key)
        if attempt_count == 1:
            redis_client.expire(cache_key, LOGIN_RATE_LIMIT_WINDOW_SECONDS)
        if attempt_count > LOGIN_RATE_LIMIT_MAX_ATTEMPTS:
            raise PermissionError
    except RedisError:
        return