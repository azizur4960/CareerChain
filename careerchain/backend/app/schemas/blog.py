import datetime
from typing import Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from app.schemas.user import UserBriefResponse


class BlogBase(BaseModel):
    title: str
    content: str
    category: str = "Career Guidance"
    image_url: Optional[str] = None
    is_published: bool = True


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None


class BlogResponse(BlogBase):
    id: int
    author_id: int
    created_at: datetime.datetime
    author: Optional[UserBriefResponse] = None

    model_config = {"from_attributes": True}
