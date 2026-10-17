from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.user import StudentProfileResponse, StudentProfileUpdate, PublicStudentResponse
from app.dependencies.auth_deps import get_current_user, get_current_student

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/me", response_model=StudentProfileResponse)
def get_my_student_profile(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Fetch profile of current logged-in student."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id, semester=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me", response_model=StudentProfileResponse)
def update_my_student_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update student profile details, skills, and links."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = profile_in.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=List[PublicStudentResponse])
def list_students(
    search: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List student users and profiles with optional search."""
    q = db.query(User).filter(User.role == "STUDENT", User.is_active == True)
    if department:
        q = q.filter(User.department == department)
    if search:
        pattern = f"%{search}%"
        q = q.outerjoin(StudentProfile).filter(
            or_(
                User.full_name.ilike(pattern),
                StudentProfile.target_role.ilike(pattern),
                StudentProfile.skills.ilike(pattern)
            )
        )
    return q.all()


@router.get("/{user_id}", response_model=PublicStudentResponse)
def get_student_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get student public profile by User ID."""
    student = db.query(User).filter(User.id == user_id, User.role == "STUDENT").first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student
