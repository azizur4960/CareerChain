import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database import Base


class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, default="Career Guidance")
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)

    # Relationship
    author = relationship("User", back_populates="blogs")

    def __repr__(self):
        return f"<Blog id={self.id} title={self.title} category={self.category}>"
