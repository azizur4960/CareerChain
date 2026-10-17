from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile, AlumniProfile
from app.models.job import Job
from app.schemas.ai import (
    JobMatchRequest, JobMatchResponse, RankedJobMatchResponse,
    MentorRecommendationResponse, AIChatRequest, AIChatResponse, ResumeMatchResponse
)
from app.services.job_service import JobService
from app.dependencies.auth_deps import get_current_user, get_current_student
from app.ai.matcher import extract_skills_from_text, match_student_to_job, recommend_alumni_mentors
from app.ai.resume_parser import MAX_RESUME_BYTES, extract_resume_text
from app.ai.assistant import get_career_assistant_response

router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.post("/match-job", response_model=JobMatchResponse)
def calculate_job_fit(
    req: JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compute fine-grained Job Fit Score between student and a specific job.
    Uses student profile by default, or allows custom simulation overrides.
    """
    job = JobService.get_job_by_id(db, req.job_id)
    student_profile = current_user.student_profile

    skills = req.custom_skills or (student_profile.skills if student_profile else "")
    target_role = req.custom_target_role or (student_profile.target_role if student_profile else "Software Engineer")
    bio = student_profile.bio if student_profile else ""
    semester = student_profile.semester if student_profile else 6
    if req.custom_experience_years is not None:
        semester = 4 + int(req.custom_experience_years / 0.35)

    result = match_student_to_job(
        student_skills_raw=skills,
        student_target_role=target_role,
        student_bio=bio,
        student_semester=semester,
        job_title=job.title,
        job_description=job.description,
        job_required_skills_raw=job.required_skills,
        job_preferred_skills_raw=job.preferred_skills,
        job_min_experience=job.minimum_experience
    )
    return result


@router.get("/match-jobs", response_model=List[RankedJobMatchResponse])
def rank_all_jobs_for_student(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Rank all active platform jobs against the current student profile."""
    student_profile = current_user.student_profile
    skills = student_profile.skills if student_profile else ""
    target_role = student_profile.target_role if student_profile else "Software Engineer"
    bio = student_profile.bio if student_profile else ""
    semester = student_profile.semester if student_profile else 6

    jobs = db.query(Job).filter(Job.status == "ACTIVE").all()
    ranked_results = []

    for job in jobs:
        match_res = match_student_to_job(
            student_skills_raw=skills,
            student_target_role=target_role,
            student_bio=bio,
            student_semester=semester,
            job_title=job.title,
            job_description=job.description,
            job_required_skills_raw=job.required_skills,
            job_preferred_skills_raw=job.preferred_skills,
            job_min_experience=job.minimum_experience
        )
        ranked_results.append({
            "job": job,
            "match_result": match_res
        })

    # Sort descending by fit score
    ranked_results.sort(key=lambda x: x["match_result"]["fit_score"], reverse=True)
    return ranked_results


@router.get("/recommend-mentors", response_model=MentorRecommendationResponse)
def get_recommended_mentors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Recommend best-matching verified alumni mentors for the student."""
    student_profile = current_user.student_profile
    skills = student_profile.skills if student_profile else ""
    target_role = student_profile.target_role if student_profile else "Software Engineer"
    department = current_user.department or "Computer Science and Engineering"

    # Query all active alumni
    alumni_users = db.query(User).filter(User.role == "ALUMNI", User.is_active == True).all()
    alumni_payload = [{"user": a, "profile": a.alumni_profile} for a in alumni_users]

    recs = recommend_alumni_mentors(
        student_target_role=target_role,
        student_skills_raw=skills,
        student_department=department,
        alumni_list=alumni_payload,
        top_k=6
    )

    return {"recommendations": recs}


@router.post("/resume-match", response_model=ResumeMatchResponse)
async def match_resume_to_job(
    job_id: int = Form(...),
    resume_text: str = Form(default=""),
    resume_file: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Extract resume skills, compare them with a job, and find relevant verified alumni."""
    if resume_file and resume_text.strip():
        raise HTTPException(status_code=422, detail="Provide resume text or upload a file, not both.")

    if resume_file:
        content = await resume_file.read(MAX_RESUME_BYTES + 1)
        try:
            parsed_resume = extract_resume_text(resume_file.filename or "", content)
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
    else:
        parsed_resume = resume_text.strip()
        if not parsed_resume:
            raise HTTPException(status_code=422, detail="Paste resume text or upload a PDF, DOCX, or TXT file.")
        if len(parsed_resume) > 20000:
            raise HTTPException(status_code=422, detail="Resume text must be 20,000 characters or fewer.")

    job = JobService.get_job_by_id(db, job_id)
    profile = current_user.student_profile
    job_skills = f"{job.required_skills or ''}, {job.preferred_skills or ''}"
    extracted_skills = extract_skills_from_text(parsed_resume, job_skills)
    match_result = match_student_to_job(
        student_skills_raw=extracted_skills,
        student_target_role=(profile.target_role if profile else "") or "Software Engineer",
        student_bio=parsed_resume[:2500],
        student_semester=profile.semester if profile else 1,
        job_title=job.title,
        job_description=job.description,
        job_required_skills_raw=job.required_skills,
        job_preferred_skills_raw=job.preferred_skills,
        job_min_experience=job.minimum_experience,
    )

    alumni_users = (
        db.query(User)
        .join(AlumniProfile)
        .filter(
            User.role == "ALUMNI",
            User.is_active.is_(True),
            AlumniProfile.is_verified.is_(True),
        )
        .all()
    )
    alumni_matches = recommend_alumni_mentors(
        student_target_role=job.title,
        student_skills_raw=extracted_skills,
        student_department=current_user.department or "",
        alumni_list=[{"user": user, "profile": user.alumni_profile} for user in alumni_users],
        top_k=5,
    )
    recommended_alumni = [
        {
            "id": item["alumni"].id,
            "full_name": item["alumni"].full_name,
            "department": item["alumni"].department,
            "company": item["alumni"].alumni_profile.current_company,
            "position": item["alumni"].alumni_profile.current_position,
            "match_score": item["match_score"],
            "shared_skills": item["shared_skills"],
        }
        for item in alumni_matches
        if item["shared_skills"]
    ]

    note = (
        "No supported technical skills were detected. Try a text-based resume or include a skills section."
        if not extracted_skills
        else "Resume files are analyzed in memory and are not saved. Skill extraction is automated; review the results."
    )
    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "extracted_skills": extracted_skills,
        "match_result": match_result,
        "recommended_alumni": recommended_alumni,
        "note": note,
    }


@router.post("/assistant/chat", response_model=AIChatResponse)
def chat_with_career_assistant(
    chat_req: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    AI Career Assistant Endpoint:
    Provides context-aware, DIU-grounded career insights using local TF-IDF RAG search.
    """
    target_role = chat_req.target_role
    if not target_role and current_user.student_profile:
        target_role = current_user.student_profile.target_role

    response = get_career_assistant_response(
        message=chat_req.message,
        target_role=target_role,
        history=chat_req.history,
    )
    return response
