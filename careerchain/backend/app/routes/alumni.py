from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User
from app.models.profile import AlumniProfile
from app.schemas.user import AlumniProfileResponse, AlumniProfileUpdate, PublicAlumniResponse
from app.dependencies.auth_deps import get_current_user, get_current_alumni

router = APIRouter(prefix="/alumni", tags=["Alumni"])


@router.get("", response_model=List[PublicAlumniResponse])
def list_alumni(
    search: Optional[str] = None,
    company: Optional[str] = None,
    batch: Optional[str] = None,
    department: Optional[str] = None,
    skills: Optional[str] = None,
    mentorship_only: Optional[bool] = False,
    verified_only: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List alumni profiles with search and filtering by company, mentorship, or verification."""
    q = db.query(User).filter(User.role == "ALUMNI", User.is_active == True)
    q = q.outerjoin(AlumniProfile)

    if mentorship_only:
        q = q.filter(AlumniProfile.is_available_for_mentorship == True)
    if verified_only:
        q = q.filter(AlumniProfile.is_verified == True)
    if company:
        q = q.filter(AlumniProfile.current_company.ilike(f"%{company}%"))
    if batch:
        q = q.filter(AlumniProfile.graduation_batch.ilike(f"%{batch}%"))
    if department:
        q = q.filter(User.department.ilike(f"%{department}%"))
    if skills:
        q = q.filter(AlumniProfile.skills.ilike(f"%{skills}%"))

    if search:
        pattern = f"%{search}%"
        q = q.filter(
            or_(
                User.full_name.ilike(pattern),
                AlumniProfile.current_company.ilike(pattern),
                AlumniProfile.current_position.ilike(pattern),
                AlumniProfile.skills.ilike(pattern)
            )
        )
    return q.all()


@router.get("/me", response_model=AlumniProfileResponse)
def get_my_alumni_profile(
    current_user: User = Depends(get_current_alumni),
    db: Session = Depends(get_db)
):
    """Fetch current alumni profile."""
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
    if not profile:
        profile = AlumniProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me", response_model=AlumniProfileResponse)
def update_my_alumni_profile(
    profile_in: AlumniProfileUpdate,
    current_user: User = Depends(get_current_alumni),
    db: Session = Depends(get_db)
):
    """Update alumni professional experience, company, and mentorship flag."""
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
    if not profile:
        profile = AlumniProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = profile_in.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=PublicAlumniResponse)
def get_alumni_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get individual alumni public profile by User ID."""
    alumni = db.query(User).filter(User.id == user_id, User.role == "ALUMNI").first()
    if not alumni:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alumni profile not found")
    return alumni
