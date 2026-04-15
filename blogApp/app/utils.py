from sqlalchemy.orm import Session

from .models.likes import BlogLike, CommentLike


def get_blog_likes_info(blog_id: int, current_user_id: int | None, db: Session) -> dict:
    """Get likes count and whether current user liked a blog post."""
    likes_count = db.query(BlogLike).filter(BlogLike.blog_id == blog_id).count()
    
    is_liked_by_current_user = False
    if current_user_id:
        is_liked_by_current_user = (
            db.query(BlogLike)
            .filter(BlogLike.blog_id == blog_id, BlogLike.user_id == current_user_id)
            .first()
            is not None
        )
    
    return {
        "likes_count": likes_count,
        "is_liked_by_current_user": is_liked_by_current_user,
    }


def get_comment_likes_info(comment_id: int, current_user_id: int | None, db: Session) -> dict:
    """Get likes count and whether current user liked a comment."""
    likes_count = db.query(CommentLike).filter(CommentLike.comment_id == comment_id).count()
    
    is_liked_by_current_user = False
    if current_user_id:
        is_liked_by_current_user = (
            db.query(CommentLike)
            .filter(CommentLike.comment_id == comment_id, CommentLike.user_id == current_user_id)
            .first()
            is not None
        )
    
    return {
        "likes_count": likes_count,
        "is_liked_by_current_user": is_liked_by_current_user,
    }
