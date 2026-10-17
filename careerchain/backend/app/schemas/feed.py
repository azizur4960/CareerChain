import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserBriefResponse


class FeedPostCreate(BaseModel):
    content: str = Field(default="", max_length=5000)
    post_type: str = "UPDATE"


class FeedCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_comment_id: Optional[int] = None


class FeedReactionCreate(BaseModel):
    emoji: str = Field(min_length=1, max_length=16)


class FeedCommentResponse(BaseModel):
    id: int
    post_id: int
    parent_comment_id: Optional[int] = None
    content: str
    is_deleted: bool = False
    created_at: datetime.datetime
    author: UserBriefResponse
    replies: List["FeedCommentResponse"] = Field(default_factory=list)

    model_config = {"from_attributes": True}


FeedCommentResponse.model_rebuild()


class FeedReactionSummary(BaseModel):
    emoji: str
    count: int
    reacted_by_me: bool


class FeedPostResponse(BaseModel):
    id: int
    content: str
    image_url: Optional[str] = None
    post_type: str
    created_at: datetime.datetime
    author: UserBriefResponse
    comments: List[FeedCommentResponse] = []
    reactions: List[FeedReactionSummary] = []


class FeedReactionResult(BaseModel):
    added: bool
    emoji: str


class FeedPageResponse(BaseModel):
    posts: List[FeedPostResponse]
    next_cursor: Optional[int] = None
