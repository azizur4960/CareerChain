import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Boolean, DateTime
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
# pyrefly: ignore [missing-import]
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    profile_image_url = Column(String(500), nullable=True)
    role = Column(String(50), nullable=False, default="STUDENT")  # STUDENT, ALUMNI, ADMIN
    university_id = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_identity_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    alumni_profile = relationship("AlumniProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="author", cascade="all, delete-orphan")
    blogs = relationship("Blog", back_populates="author", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="organizer", cascade="all, delete-orphan")
    sent_messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"
