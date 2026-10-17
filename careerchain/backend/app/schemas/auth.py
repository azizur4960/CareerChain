from typing import Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr, Field, TypeAdapter, field_validator, model_validator


_email_adapter = TypeAdapter(EmailStr)


def _validate_email(value: str) -> str:
    value = value.strip()
    if value.lower().endswith("@careerchain.local"):
        local_part = value.rsplit("@", 1)[0]
        normalized_local_part = _email_adapter.validate_python(f"{local_part}@example.com").rsplit("@", 1)[0]
        return f"{normalized_local_part}@careerchain.local"
    return _email_adapter.validate_python(value)


class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: str = Field(default="STUDENT", description="STUDENT or ALUMNI")
    university_id: Optional[str] = Field(default=None, max_length=50)
    department: Optional[str] = "Computer Science and Engineering"

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _validate_email(value)

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return value

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Full name must contain at least two non-whitespace characters")
        return value

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, value: str) -> str:
        normalized = str(value or "STUDENT").strip().upper()
        if normalized not in {"STUDENT", "ALUMNI"}:
            raise ValueError("Public registration is limited to student and alumni accounts")
        return normalized

    @model_validator(mode="after")
    def require_university_identifier(self):
        has_university_id = bool((self.university_id or "").strip())
        has_institutional_email = self.email.lower().endswith("@diu.edu.bd")
        if not has_university_id and not has_institutional_email:
            raise ValueError("Provide a DIU university ID or a @diu.edu.bd email address")
        if self.university_id is not None:
            self.university_id = self.university_id.strip() or None
        return self


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _validate_email(value)


class PasswordResetRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _validate_email(value)


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return value


class PasswordResetByUniversityId(BaseModel):
    email: str
    university_id: str = Field(..., min_length=1, max_length=50)
    new_password: str = Field(..., min_length=8)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _validate_email(value)

    @field_validator("university_id")
    @classmethod
    def normalize_university_id(cls, value: str) -> str:
        return value.strip()

    @field_validator("new_password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return value


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
