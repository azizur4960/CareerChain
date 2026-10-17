from typing import List, Dict, Any
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.profile import AlumniProfile, StudentProfile
from app.models.job import Job
from app.models.blog import Blog
from app.models.event import Event
from app.schemas.user import UserResponse
from app.dependencies.auth_deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats", response_model=Dict[str, Any])
def get_platform_statistics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Aggregate statistics for admin dashboard overview."""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "STUDENT").count()
    total_alumni = db.query(User).filter(User.role == "ALUMNI").count()
    verified_alumni = db.query(AlumniProfile).filter(AlumniProfile.is_verified == True).count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "ACTIVE").count()
    total_blogs = db.query(Blog).count()
    total_events = db.query(Event).count()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_alumni": total_alumni,
        "verified_alumni": verified_alumni,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_blogs": total_blogs,
        "total_events": total_events
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: str = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """List all platform users with filtering."""
    q = db.query(User)
    if role:
        q = q.filter(User.role == role.upper())
    return q.order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Toggle user active / suspended status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate yourself")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/verify-identity", response_model=UserResponse)
def toggle_identity_verification(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mark a user's DIU identity as verified after manual university ID review."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.university_id and not user.email.lower().endswith("@diu.edu.bd"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A university ID or @diu.edu.bd email is required before verification",
        )
    user.is_identity_verified = not user.is_identity_verified
    db.commit()
    db.refresh(user)
    return user


@router.patch("/alumni/{profile_id}/verify")
def toggle_alumni_verification(
    profile_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Toggle verified credential status for an alumni."""
    profile = db.query(AlumniProfile).filter(AlumniProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alumni profile not found")

    profile.is_verified = not profile.is_verified
    db.commit()
    db.refresh(profile)
    return {
        "profile_id": profile.id,
        "user_id": profile.user_id,
        "is_verified": profile.is_verified,
        "message": f"Alumni verification set to {profile.is_verified}"
    }
