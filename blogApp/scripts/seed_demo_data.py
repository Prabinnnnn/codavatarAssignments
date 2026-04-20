from pathlib import Path
import sys

from dotenv import load_dotenv
from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models.blog import BlogPost
from app.models.comment import Comment
from app.models.likes import BlogLike, CommentLike
from app.models.user import User


load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")


DEMO_PASSWORD = "DemoPass123!"

USERS = [
    {"username": "alice", "email": "alice@example.com"},
    {"username": "bob", "email": "bob@example.com"},
    {"username": "carol", "email": "carol@example.com"},
]

BLOGS = [
    {
        "title": "Demo: Getting started with FastAPI",
        "content": "A short post for testing the blog feed, detail views, and like counts.",
        "author": "alice",
        "owner_username": "alice",
    },
    {
        "title": "Demo: Redis caching in practice",
        "content": "This post is used to verify cache hits on repeated read requests.",
        "author": "bob",
        "owner_username": "bob",
    },
    {
        "title": "Demo: Comments and moderation",
        "content": "A sample post for exercising comment creation, update, and delete flows.",
        "author": "carol",
        "owner_username": "carol",
    },
]

COMMENTS = [
    {
        "blog_title": "Demo: Getting started with FastAPI",
        "content": "This is a helpful demo comment.",
        "username": "bob",
    },
    {
        "blog_title": "Demo: Getting started with FastAPI",
        "content": "Another comment to test comment lists.",
        "username": "carol",
    },
    {
        "blog_title": "Demo: Redis caching in practice",
        "content": "Redis should make this response fast on repeat reads.",
        "username": "alice",
    },
    {
        "blog_title": "Demo: Comments and moderation",
        "content": "Nice structure for moderation testing.",
        "username": "alice",
    },
]


def get_or_create_user(session, username: str, email: str) -> User:
    user = session.scalar(select(User).where(User.username == username))
    if user is not None:
        return user

    user = User(username=username, email=email, hashed_password=get_password_hash(DEMO_PASSWORD))
    session.add(user)
    session.flush()
    return user


def get_or_create_blog(session, owner: User, title: str, content: str, author: str) -> BlogPost:
    blog = session.scalar(select(BlogPost).where(BlogPost.title == title))
    if blog is not None:
        return blog

    blog = BlogPost(title=title, content=content, author=author, owner_id=owner.id)
    session.add(blog)
    session.flush()
    return blog


def get_or_create_comment(session, blog: BlogPost, user: User, content: str) -> Comment:
    comment = session.scalar(
        select(Comment).where(
            Comment.blog_id == blog.id,
            Comment.user_id == user.id,
            Comment.content == content,
        )
    )
    if comment is not None:
        return comment

    comment = Comment(content=content, blog_id=blog.id, user_id=user.id)
    session.add(comment)
    session.flush()
    return comment


def ensure_blog_like(session, user: User, blog: BlogPost) -> None:
    exists = session.scalar(
        select(BlogLike).where(BlogLike.user_id == user.id, BlogLike.blog_id == blog.id)
    )
    if exists is None:
        session.add(BlogLike(user_id=user.id, blog_id=blog.id))


def ensure_comment_like(session, user: User, comment: Comment) -> None:
    exists = session.scalar(
        select(CommentLike).where(CommentLike.user_id == user.id, CommentLike.comment_id == comment.id)
    )
    if exists is None:
        session.add(CommentLike(user_id=user.id, comment_id=comment.id))


def main() -> None:
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        users_by_name: dict[str, User] = {}
        for user_data in USERS:
            user = get_or_create_user(session, user_data["username"], user_data["email"])
            users_by_name[user.username] = user

        blogs_by_title: dict[str, BlogPost] = {}
        for blog_data in BLOGS:
            owner = users_by_name[blog_data["owner_username"]]
            blog = get_or_create_blog(session, owner, blog_data["title"], blog_data["content"], blog_data["author"])
            blogs_by_title[blog.title] = blog

        comments_by_key: dict[tuple[str, str], Comment] = {}
        for comment_data in COMMENTS:
            blog = blogs_by_title[comment_data["blog_title"]]
            user = users_by_name[comment_data["username"]]
            comment = get_or_create_comment(session, blog, user, comment_data["content"])
            comments_by_key[(blog.title, comment.content)] = comment

        ensure_blog_like(session, users_by_name["bob"], blogs_by_title["Demo: Getting started with FastAPI"])
        ensure_blog_like(session, users_by_name["carol"], blogs_by_title["Demo: Getting started with FastAPI"])
        ensure_blog_like(session, users_by_name["alice"], blogs_by_title["Demo: Redis caching in practice"])
        ensure_blog_like(session, users_by_name["carol"], blogs_by_title["Demo: Redis caching in practice"])
        ensure_blog_like(session, users_by_name["alice"], blogs_by_title["Demo: Comments and moderation"])

        ensure_comment_like(session, users_by_name["alice"], comments_by_key[("Demo: Getting started with FastAPI", "This is a helpful demo comment.")])
        ensure_comment_like(session, users_by_name["carol"], comments_by_key[("Demo: Getting started with FastAPI", "This is a helpful demo comment.")])
        ensure_comment_like(session, users_by_name["bob"], comments_by_key[("Demo: Redis caching in practice", "Redis should make this response fast on repeat reads.")])
        ensure_comment_like(session, users_by_name["bob"], comments_by_key[("Demo: Comments and moderation", "Nice structure for moderation testing.")])

        session.commit()
        print("Seeded demo users, blogs, comments, and likes.")
        print(f"Demo password for all users: {DEMO_PASSWORD}")
    finally:
        session.close()


if __name__ == "__main__":
    main()