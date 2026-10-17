from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.services.job_service import JobService
from app.dependencies.auth_deps import get_current_user, get_current_alumni, get_optional_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = None,
    work_mode: Optional[str] = None,
    employment_type: Optional[str] = None,
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve active job postings with flexible filtering."""
    return JobService.list_jobs(
        db=db,
        query=search,
        work_mode=work_mode,
        employment_type=employment_type,
        status_filter="ACTIVE"
    )


@router.get("/my/listings", response_model=List[JobResponse])
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Get jobs posted by the current alumni or admin."""
    return JobService.get_user_jobs(db, current_user.id)


@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(
    job_id: int,
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_current_user)
):
    """Fetch details of a single job opening."""
    return JobService.get_job_by_id(db, job_id)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Post a new job opening (Alumni or Admin only)."""
    return JobService.create_job(db, job_in, current_user)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Update an existing job posting."""
    return JobService.update_job(db, job_id, job_in, current_user)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Delete or archive a job posting."""
    JobService.delete_job(db, job_id, current_user)
    return None
