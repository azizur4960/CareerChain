from app.schemas.auth import UserRegister, UserLogin, Token, TokenPayload
from app.schemas.user import (
    StudentProfileBase, StudentProfileUpdate, StudentProfileResponse,
    AlumniProfileBase, AlumniProfileUpdate, AlumniProfileResponse,
    UserResponse, UserBriefResponse
)
from app.schemas.job import JobBase, JobCreate, JobUpdate, JobResponse
from app.schemas.ai import (
    JobMatchRequest, JobMatchResponse, JobMatchBreakdown,
    RankedJobMatchResponse, MentorRecommendation, MentorRecommendationResponse,
    AIChatMessage, AIChatRequest, AIChatResponse
)
from app.schemas.blog import BlogBase, BlogCreate, BlogUpdate, BlogResponse
from app.schemas.event import EventBase, EventCreate, EventUpdate, EventResponse
from app.schemas.message import MessageCreate, MessageResponse, ConversationResponse

__all__ = [
    "UserRegister", "UserLogin", "Token", "TokenPayload",
    "StudentProfileBase", "StudentProfileUpdate", "StudentProfileResponse",
    "AlumniProfileBase", "AlumniProfileUpdate", "AlumniProfileResponse",
    "UserResponse", "UserBriefResponse",
    "JobBase", "JobCreate", "JobUpdate", "JobResponse",
    "JobMatchRequest", "JobMatchResponse", "JobMatchBreakdown",
    "RankedJobMatchResponse", "MentorRecommendation", "MentorRecommendationResponse",
    "AIChatMessage", "AIChatRequest", "AIChatResponse",
    "BlogBase", "BlogCreate", "BlogUpdate", "BlogResponse",
    "EventBase", "EventCreate", "EventUpdate", "EventResponse",
    "MessageCreate", "MessageResponse", "ConversationResponse"
]
