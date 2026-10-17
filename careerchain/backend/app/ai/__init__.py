"""CareerChain AI Engine Package"""
from app.ai.matcher import match_student_to_job, recommend_alumni_mentors
from app.ai.assistant import get_career_assistant_response
from app.ai.knowledge_base import knowledge_base

__all__ = [
    "match_student_to_job",
    "recommend_alumni_mentors",
    "get_career_assistant_response",
    "knowledge_base"
]
