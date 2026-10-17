# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    semester = Column(Integer, default=1, nullable=False)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated or JSON string of skills
    target_role = Column(String(100), nullable=True)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    cv_url = Column(String(255), nullable=True)

    # Relationship
    user = relationship("User", back_populates="student_profile")

    def __repr__(self):
        return f"<StudentProfile id={self.id} user_id={self.user_id} target_role={self.target_role}>"


class AlumniProfile(Base):
    __tablename__ = "alumni_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    graduation_batch = Column(String(50), nullable=True)
    current_company = Column(String(255), nullable=True)
    current_position = Column(String(255), nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated or JSON string of skills
    bio = Column(Text, nullable=True)
    years_of_experience = Column(Integer, default=0, nullable=False)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    is_available_for_mentorship = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationship
    user = relationship("User", back_populates="alumni_profile")

    def __repr__(self):
        return f"<AlumniProfile id={self.id} user_id={self.user_id} company={self.current_company}>"
