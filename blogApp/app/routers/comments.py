from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import CurrentUser
from ..models.blog import BlogPost
from ..models.comment import Comment
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
    return _add_likes_info(comment, current_user.id, db)


@router.get("/blogs/{blog_id}/comments", response_model=list[CommentResponse])
def list_comments(blog_id: int, db: Session = Depends(get_db)):
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    comments = db.query(Comment).filter(Comment.blog_id == blog_id).all()
    return [_add_likes_info(c, None, db) for c in comments]


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
    return comment


@router.get("/comments/{comment_id}", response_model=CommentResponse)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment
