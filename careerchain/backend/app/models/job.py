import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    work_mode = Column(String(50), default="Onsite", nullable=False)  # Remote, Onsite, Hybrid
    employment_type = Column(String(50), default="Full-time", nullable=False)  # Full-time, Internship, Part-time, Contract
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    required_skills = Column(Text, nullable=False)  # JSON or comma-separated list
    preferred_skills = Column(Text, nullable=True)  # JSON or comma-separated list
    minimum_experience = Column(Integer, default=0, nullable=False)  # In years
    application_url = Column(String(255), nullable=True)
    referral_available = Column(Boolean, default=False, nullable=False)
    referral_url = Column(String(255), nullable=True)
    posted_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, CLOSED

    # Relationship
    author = relationship("User", back_populates="jobs")

    def __repr__(self):
        return f"<Job id={self.id} title={self.title} company={self.company}>"
