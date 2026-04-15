from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CommentCreate(BaseModel):
    content: str


class CommentUpdate(BaseModel):
    content: str | None = None


class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    updated_at: datetime
    blog_id: int
    user_id: int
    likes_count: int = 0
    is_liked_by_current_user: bool = False
    model_config = ConfigDict(from_attributes=True)
