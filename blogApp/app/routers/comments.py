from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..email_service import notification_enabled, send_comment_notification

from ..auth import CurrentUser, get_current_user_optional
from ..cache import (
    comment_detail_cache_key,
    comment_list_cache_key,
    get_cached_payload,
    invalidate_comment_cache,
    set_cached_payload,
)
from ..models.blog import BlogPost
from ..models.comment import Comment
from ..models.user import User
from ..schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from ..database import get_db
from ..utils import get_comment_likes_info


def _add_likes_info(comment: Comment, current_user_id: int | None, db: Session) -> dict:
    """Convert comment ORM to response dict with likes info."""
    comment_dict = {
        "id": comment.id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "blog_id": comment.blog_id,
        "user_id": comment.user_id,
    }
    likes_info = get_comment_likes_info(comment.id, current_user_id, db)
    comment_dict.update(likes_info)
    return comment_dict


router = APIRouter(tags=["comments"])


@router.post("/blogs/{blog_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    blog_id: int,
    payload: CommentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    comment = Comment(
        content=payload.content,
        blog_id=blog_id,
        user_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # scheduling notification after successful write to db
    if notification_enabled() and blog.owner_id != current_user.id and blog.owner and blog.owner.email:
        background_tasks.add_task(
            send_comment_notification,
            blog.owner.email,
            blog.owner.username,
            current_user.username,
            blog.title,
            blog.id,
            payload.content[:120],
        )
    response = _add_likes_info(comment, current_user.id, db)
    invalidate_comment_cache(comment.id)
    return response


@router.get("/blogs/{blog_id}/comments", response_model=list[CommentResponse])
def list_comments(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    current_user_id = current_user.id if current_user is not None else None
    cache_key = comment_list_cache_key(blog_id, current_user_id)
    cached_response = get_cached_payload(cache_key)
    if cached_response is not None:
        return cached_response

    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    comments = db.query(Comment).filter(Comment.blog_id == blog_id).all()
    response = [_add_likes_info(c, current_user_id, db) for c in comments]
    set_cached_payload(cache_key, response)
    return response


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), *, current_user: CurrentUser):
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this comment")
    db.delete(comment)
    db.commit()


@router.put("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to modify this comment")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(comment, field, value)

    db.commit()
    db.refresh(comment)
    invalidate_comment_cache(comment.id)
    return comment


@router.get("/comments/{comment_id}", response_model=CommentResponse)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    current_user_id = current_user.id if current_user is not None else None
    cache_key = comment_detail_cache_key(comment_id, current_user_id)
    cached_response = get_cached_payload(cache_key)
    if cached_response is not None:
        return cached_response

    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    response = _add_likes_info(comment, current_user_id, db)
    set_cached_payload(cache_key, response)
    return response
