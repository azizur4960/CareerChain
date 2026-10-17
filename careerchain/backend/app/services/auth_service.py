from typing import Optional
import datetime
import jwt
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.profile import StudentProfile, AlumniProfile
from app.schemas.auth import UserRegister, UserLogin
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import settings


class AuthService:
    @staticmethod
    def reset_password_with_university_id(db: Session, email: str, university_id: str, new_password: str) -> None:
        user = db.query(User).filter(
            User.email == email.lower(), User.university_id == university_id.strip()
        ).first()
        if not user:
            raise HTTPException(status_code=400, detail="Email or university ID is incorrect.")
        user.hashed_password = get_password_hash(new_password)
        db.commit()

    @staticmethod
    def create_password_reset_token(user: User) -> str:
        now = datetime.datetime.utcnow()
        return jwt.encode({"sub": str(user.id), "purpose": "password_reset", "iat": now,
                           "exp": now + datetime.timedelta(minutes=30)},
                          settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            if payload.get("purpose") != "password_reset":
                raise ValueError("wrong token purpose")
            user_id = int(payload["sub"])
        except (jwt.PyJWTError, ValueError, KeyError, TypeError) as error:
            raise HTTPException(status_code=400, detail="This password reset link is invalid or expired.") from error
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="This password reset link is invalid or expired.")
        user.hashed_password = get_password_hash(new_password)
        db.commit()

    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> User:
        """Register a new user and initialize role-appropriate profile."""
        existing = db.query(User).filter(User.email == user_data.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists"
            )

        role = user_data.role.upper()
        if role not in ["STUDENT", "ALUMNI"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Public registration is limited to student and alumni accounts"
            )

        hashed_pwd = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email.lower(),
            hashed_password=hashed_pwd,
            full_name=user_data.full_name,
            role=role,
            university_id=user_data.university_id,
            department=user_data.department or "Computer Science and Engineering",
            is_active=True
        )
        db.add(new_user)
        db.flush()

        # Initialize profile
        if role == "STUDENT":
            student_profile = StudentProfile(
                user_id=new_user.id,
                semester=1,
                bio="",
                skills="Python, Git, Problem Solving",
                target_role="Software Engineer"
            )
            db.add(student_profile)
        elif role == "ALUMNI":
            alumni_profile = AlumniProfile(
                user_id=new_user.id,
                graduation_batch="2023",
                current_company="Tech Industry",
                current_position="Software Engineer",
                skills="Python, JavaScript, SQL",
                bio="DIU Alumni passionate about mentoring next-gen developers.",
                years_of_experience=1,
                is_available_for_mentorship=True,
                is_verified=False
            )
            db.add(alumni_profile)

        try:
            db.commit()
        except IntegrityError as error:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address or university ID already exists",
            ) from error
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> User:
        """Verify user credentials and return active user object."""
        user = db.query(User).filter(User.email == credentials.email.lower()).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )
        return user

    @staticmethod
    def generate_token_for_user(user: User) -> dict:
        """Generate JWT access token and formatted user dictionary."""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
        access_token = create_access_token(token_data)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "profile_image_url": user.profile_image_url,
                "role": user.role,
                "university_id": user.university_id,
                "department": user.department,
                "is_active": user.is_active,
                "is_identity_verified": user.is_identity_verified,
            }
        }
