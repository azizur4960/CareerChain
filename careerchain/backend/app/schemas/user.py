import datetime
from typing import Optional, List, Any
# pyrefly: ignore [missing-import] from pydantic import EmailStr
from pydantic import BaseModel, Field


class StudentProfileBase(BaseModel):
    semester: int = Field(default=1, ge=1, le=12)
    bio: Optional[str] = Field(default=None, max_length=5000)
    skills: Optional[str] = Field(default=None, max_length=5000)
    target_role: Optional[str] = Field(default=None, max_length=100)
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    cv_url: Optional[str] = None


class StudentProfileUpdate(BaseModel):
    semester: Optional[int] = Field(default=None, ge=1, le=12)
    bio: Optional[str] = Field(default=None, max_length=5000)
    skills: Optional[str] = Field(default=None, max_length=5000)
    target_role: Optional[str] = Field(default=None, max_length=100)
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    cv_url: Optional[str] = None


class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class PublicStudentProfileResponse(BaseModel):
    id: int
    user_id: int
    semester: int = 1
    bio: Optional[str] = None
    skills: Optional[str] = None
    target_role: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    model_config = {"from_attributes": True}


class AlumniProfileBase(BaseModel):
    graduation_batch: Optional[str] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: int = 0
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    is_available_for_mentorship: bool = True
    is_verified: bool = False


class AlumniProfileUpdate(BaseModel):
    graduation_batch: Optional[str] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = Field(default=None, ge=0, le=80)
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    is_available_for_mentorship: Optional[bool] = None


class AlumniProfileResponse(AlumniProfileBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class UserBriefResponse(BaseModel):
    id: int
    full_name: str
    role: str
    department: Optional[str] = None
    profile_image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class PublicAlumniResponse(BaseModel):
    id: int
    full_name: str
    role: str
    profile_image_url: Optional[str] = None
    department: Optional[str] = None
    alumni_profile: Optional[AlumniProfileResponse] = None

    model_config = {"from_attributes": True}


class PublicStudentResponse(BaseModel):
    id: int
    full_name: str
    role: str
    profile_image_url: Optional[str] = None
    department: Optional[str] = None
    student_profile: Optional[PublicStudentProfileResponse] = None

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: int
    email: str  # str (not EmailStr) to allow legacy seed data with .local domains
    full_name: str
    profile_image_url: Optional[str] = None
    role: str
    university_id: Optional[str] = None
    department: Optional[str] = None
    is_active: bool
    is_identity_verified: bool = False
    created_at: datetime.datetime
    updated_at: datetime.datetime
    student_profile: Optional[StudentProfileResponse] = None
    alumni_profile: Optional[AlumniProfileResponse] = None

    model_config = {"from_attributes": True}
