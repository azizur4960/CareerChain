from typing import List, Optional, Dict, Any, Literal
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, field_validator
# pyrefly: ignore [missing-import]  
from app.schemas.job import JobResponse
# pyrefly: ignore [missing-import]
from app.schemas.user import PublicAlumniResponse


class JobMatchBreakdown(BaseModel):
    skill_match: float
    role_match: float
    experience_match: float
    preferred_skills_match: float


class JobMatchResponse(BaseModel):
    fit_score: float
    breakdown: JobMatchBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    recommendation: str
    disclaimer: str = (
        "CareerChain Fit Score is an AI-assisted compatibility estimate based on profile "
        "and job information. It does not represent a hiring decision or guarantee employment."
    )


class JobMatchRequest(BaseModel):
    job_id: int
    custom_skills: Optional[str] = None
    custom_target_role: Optional[str] = None
    custom_experience_years: Optional[int] = None


class RankedJobMatchResponse(BaseModel):
    job: JobResponse
    match_result: JobMatchResponse


class MentorRecommendation(BaseModel):
    alumni: PublicAlumniResponse
    match_score: float
    shared_skills: List[str]
    explanation: str


class MentorRecommendationResponse(BaseModel):
    recommendations: List[MentorRecommendation]


class AIChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class AIChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=2000)
    target_role: Optional[str] = Field(default=None, max_length=100)
    history: List[AIChatMessage] = Field(default_factory=list, max_length=20)

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Enter a career question with at least 2 characters")
        return value


class AIChatResponse(BaseModel):
    reply: str
    intent: str = "career_guidance"
    supported: bool = True
    retrieved_sources: List[Dict[str, Any]] = []
    suggestions: List[str] = []
    disclaimer: str = (
        "AI-generated career guidance may contain errors. Verify important "
        "career decisions using trusted sources or professional advice."
    )


class ResumeAlumniMatch(BaseModel):
    id: int
    full_name: str
    department: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    match_score: float
    shared_skills: List[str]


class ResumeMatchResponse(BaseModel):
    job_id: int
    job_title: str
    company: str
    extracted_skills: List[str]
    match_result: JobMatchResponse
    recommended_alumni: List[ResumeAlumniMatch]
    note: str
