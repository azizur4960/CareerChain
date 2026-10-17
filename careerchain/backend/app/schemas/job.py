import datetime
from typing import Optional, Literal
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, model_validator
from app.schemas.user import UserBriefResponse


class JobBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    work_mode: Literal["Remote", "Onsite", "Hybrid"] = "Onsite"
    employment_type: Literal["Full-time", "Internship", "Part-time", "Contract"] = "Full-time"
    description: str = Field(..., min_length=1, max_length=20000)
    responsibilities: Optional[str] = None
    required_skills: str = Field(..., min_length=1, max_length=5000)
    preferred_skills: Optional[str] = None
    minimum_experience: int = Field(default=0, ge=0, le=80)
    application_url: Optional[str] = None
    referral_available: bool = False
    referral_url: Optional[str] = None
    expires_at: Optional[datetime.datetime] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    company: Optional[str] = Field(default=None, min_length=1, max_length=255)
    location: Optional[str] = Field(default=None, min_length=1, max_length=255)
    work_mode: Optional[Literal["Remote", "Onsite", "Hybrid"]] = None
    employment_type: Optional[Literal["Full-time", "Internship", "Part-time", "Contract"]] = None
    description: Optional[str] = Field(default=None, min_length=1, max_length=20000)
    responsibilities: Optional[str] = None
    required_skills: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    preferred_skills: Optional[str] = None
    minimum_experience: Optional[int] = Field(default=None, ge=0, le=80)
    application_url: Optional[str] = None
    referral_available: Optional[bool] = None
    referral_url: Optional[str] = None
    expires_at: Optional[datetime.datetime] = None
    status: Optional[Literal["ACTIVE", "CLOSED"]] = None

    @model_validator(mode="after")
    def reject_null_required_fields(self):
        for field in ("title", "company", "location", "work_mode", "employment_type", "description", "required_skills", "minimum_experience", "referral_available", "status"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class JobResponse(JobBase):
    id: int
    posted_by: int
    created_at: datetime.datetime
    status: str
    author: Optional[UserBriefResponse] = None

    model_config = {"from_attributes": True}
