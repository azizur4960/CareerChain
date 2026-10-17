from typing import List, Optional
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import or_
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobUpdate


class JobService:
    @staticmethod
    def get_job_by_id(db: Session, job_id: int) -> Job:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job with ID {job_id} not found"
            )
        return job

    @staticmethod
    def list_jobs(
        db: Session,
        query: Optional[str] = None,
        work_mode: Optional[str] = None,
        employment_type: Optional[str] = None,
        status_filter: Optional[str] = "ACTIVE",
        skip: int = 0,
        limit: int = 100
    ) -> List[Job]:
        q = db.query(Job)
        if status_filter:
            q = q.filter(Job.status == status_filter)
        if work_mode:
            q = q.filter(Job.work_mode == work_mode)
        if employment_type:
            q = q.filter(Job.employment_type == employment_type)
        if query:
            pattern = f"%{query}%"
            q = q.filter(
                or_(
                    Job.title.ilike(pattern),
                    Job.company.ilike(pattern),
                    Job.description.ilike(pattern),
                    Job.required_skills.ilike(pattern)
                )
            )
        return q.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create_job(db: Session, job_in: JobCreate, current_user: User) -> Job:
        job_data = job_in.model_dump()
        new_job = Job(
            **job_data,
            posted_by=current_user.id,
            status="ACTIVE"
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job

    @staticmethod
    def update_job(db: Session, job_id: int, job_in: JobUpdate, current_user: User) -> Job:
        job = JobService.get_job_by_id(db, job_id)
        if job.posted_by != current_user.id and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this job posting"
            )
        
        update_data = job_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(job, field, value)

        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def delete_job(db: Session, job_id: int, current_user: User) -> bool:
        job = JobService.get_job_by_id(db, job_id)
        if job.posted_by != current_user.id and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this job posting"
            )
        db.delete(job)
        db.commit()
        return True

    @staticmethod
    def get_user_jobs(db: Session, user_id: int) -> List[Job]:
        return db.query(Job).filter(Job.posted_by == user_id).order_by(Job.created_at.desc()).all()
