import datetime
from typing import Optional, List
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, field_validator
# pyrefly: ignore [missing-import]
from app.schemas.user import UserBriefResponse


class MessageCreate(BaseModel):
    recipient_id: int
    content: str = Field(..., min_length=1, max_length=10000)

    @field_validator("content")
    @classmethod
    def reject_whitespace_only(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Message content cannot be empty")
        return value


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    created_at: datetime.datetime
    is_read: bool
    sender: Optional[UserBriefResponse] = None

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: int
    participant1_id: int
    participant2_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    participant1: Optional[UserBriefResponse] = None
    participant2: Optional[UserBriefResponse] = None
    other_user: Optional[UserBriefResponse] = None
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0

    model_config = {"from_attributes": True}
