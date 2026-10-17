import datetime
from typing import Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from app.schemas.user import UserBriefResponse


class EventBase(BaseModel):
    title: str
    description: str
    event_type: str = "Webinar"     
    date: str  # YYYY-MM-DD
    time: str  # e.g., 07:00 PM BST
    location: str = "Online"
    meeting_url: Optional[str] = None
    registration_url: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    meeting_url: Optional[str] = None
    registration_url: Optional[str] = None


class EventResponse(EventBase):
    id: int
    organizer_id: int
    created_at: datetime.datetime
    organizer: Optional[UserBriefResponse] = None

    model_config = {"from_attributes": True}
