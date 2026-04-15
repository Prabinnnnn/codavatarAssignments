from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BlogBase(BaseModel):
    title: str
    content: str


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class BlogResponse(BlogBase):
    id: int
    author: str
    created_at: datetime
    likes_count: int = 0
    is_liked_by_current_user: bool = False
    model_config = ConfigDict(from_attributes=True)
