from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import CurrentUser, get_current_user_optional
from ..cache import (
    blog_detail_cache_key,
    blog_list_cache_key,
    get_cached_payload,
    invalidate_blog_cache,
    set_cached_payload,
)
from ..models.blog import BlogPost
from ..models.user import User
from ..schemas.blog import BlogCreate, BlogResponse, BlogUpdate
from ..database import get_db
from ..utils import get_blog_likes_info


def _add_likes_info(blog: BlogPost, current_user_id: int | None, db: Session) -> dict:
    """Convert blog ORM to response dict with likes info."""
    blog_dict = {
        "id": blog.id,
        "title": blog.title,
        "content": blog.content,
        "author": blog.author,
        "created_at": blog.created_at,
    }
    likes_info = get_blog_likes_info(blog.id, current_user_id, db)
    blog_dict.update(likes_info)
    return blog_dict


router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
def create_blog(payload: BlogCreate, db: Session = Depends(get_db), *, current_user: CurrentUser):
    blog = BlogPost(
        **payload.model_dump(),
        author=current_user.username,
        owner_id=current_user.id,
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    response = _add_likes_info(blog, current_user.id, db)
    invalidate_blog_cache(blog.id)
    return response


@router.get("/", response_model=list[BlogResponse])
def list_blogs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    current_user: User | None = Depends(get_current_user_optional),
):
    current_user_id = current_user.id if current_user is not None else None
    cache_key = blog_list_cache_key(skip, limit, current_user_id)
    cached_response = get_cached_payload(cache_key)
    if cached_response is not None:
        return cached_response

    blogs = db.query(BlogPost).offset(skip).limit(limit).all()
    response = [_add_likes_info(blog, current_user_id, db) for blog in blogs]
    set_cached_payload(cache_key, response)
    return response


@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    current_user_id = current_user.id if current_user is not None else None
    cache_key = blog_detail_cache_key(blog_id, current_user_id)
    cached_response = get_cached_payload(cache_key)
    if cached_response is not None:
        return cached_response

    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    response = _add_likes_info(blog, current_user_id, db)
    set_cached_payload(cache_key, response)
    return response


@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(
    blog_id: int,
    payload: BlogUpdate,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if blog.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to modify this post")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(blog, field, value)

    db.commit()
    db.refresh(blog)
    response = _add_likes_info(blog, current_user.id, db)
    invalidate_blog_cache(blog.id)
    return response


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(blog_id: int, db: Session = Depends(get_db), *, current_user: CurrentUser):
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if blog.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this post")

    db.delete(blog)
    db.commit()
    invalidate_blog_cache(blog_id)
