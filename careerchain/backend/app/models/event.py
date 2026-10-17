import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    event_type = Column(String(100), nullable=False, default="Webinar")  # Webinar, Workshop, Networking, Career Fair
    date = Column(String(50), nullable=False)  # e.g., '2025-11-15'
    time = Column(String(50), nullable=False)  # e.g., '07:00 PM BST'
    location = Column(String(255), nullable=False, default="Online")
    meeting_url = Column(String(255), nullable=True)
    organizer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    registration_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationship
    organizer = relationship("User", back_populates="events")

    def __repr__(self):
        return f"<Event id={self.id} title={self.title} date={self.date}>"
