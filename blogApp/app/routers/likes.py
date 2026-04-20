from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..cache import invalidate_blog_cache, invalidate_comment_cache
from ..auth import CurrentUser
from ..models.blog import BlogPost
from ..models.comment import Comment
from ..database import get_db
from ..models.likes import BlogLike, CommentLike


router = APIRouter(tags=["likes"])


@router.post("/blogs/{blog_id}/likes", status_code=status.HTTP_201_CREATED)
def like_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    """Like a blog post. Returns 400 if already liked."""
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Check if already liked
    existing_like = db.query(BlogLike).filter(
        BlogLike.user_id == current_user.id,
        BlogLike.blog_id == blog_id,
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="You already liked this post")

    # Create like
    like = BlogLike(user_id=current_user.id, blog_id=blog_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    invalidate_blog_cache(blog_id)

    likes_count = db.query(BlogLike).filter(BlogLike.blog_id == blog_id).count()
    return {"message": "Post liked successfully", "likes_count": likes_count}


@router.delete("/blogs/{blog_id}/likes", status_code=status.HTTP_200_OK)
def unlike_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    """Unlike a blog post."""
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    like = db.query(BlogLike).filter(
        BlogLike.user_id == current_user.id,
        BlogLike.blog_id == blog_id,
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="You haven't liked this post")

    db.delete(like)
    db.commit()
    invalidate_blog_cache(blog_id)

    likes_count = db.query(BlogLike).filter(BlogLike.blog_id == blog_id).count()
    return {"message": "Post unliked successfully", "likes_count": likes_count}


@router.post("/comments/{comment_id}/likes", status_code=status.HTTP_201_CREATED)
def like_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    """Like a comment. Returns 400 if already liked."""
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if already liked
    existing_like = db.query(CommentLike).filter(
        CommentLike.user_id == current_user.id,
        CommentLike.comment_id == comment_id,
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="You already liked this comment")

    # Create like
    like = CommentLike(user_id=current_user.id, comment_id=comment_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    invalidate_comment_cache(comment_id)

    likes_count = db.query(CommentLike).filter(CommentLike.comment_id == comment_id).count()
    return {"message": "Comment liked successfully", "likes_count": likes_count}


@router.delete("/comments/{comment_id}/likes", status_code=status.HTTP_200_OK)
def unlike_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    """Unlike a comment."""
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    like = db.query(CommentLike).filter(
        CommentLike.user_id == current_user.id,
        CommentLike.comment_id == comment_id,
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="You haven't liked this comment")

    db.delete(like)
    db.commit()
    invalidate_comment_cache(comment_id)

    likes_count = db.query(CommentLike).filter(CommentLike.comment_id == comment_id).count()
    return {"message": "Comment unliked successfully", "likes_count": likes_count}
