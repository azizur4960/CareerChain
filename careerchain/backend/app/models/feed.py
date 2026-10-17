import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class FeedPost(Base):
    __tablename__ = "feed_posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    post_type = Column(String(30), nullable=False, default="UPDATE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    author = relationship("User")
    comments = relationship("FeedComment", cascade="all, delete-orphan", order_by="FeedComment.created_at.asc()")
    reactions = relationship("FeedReaction", cascade="all, delete-orphan")


class FeedComment(Base):
    __tablename__ = "feed_comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("feed_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_comment_id = Column(Integer, ForeignKey("feed_comments.id", ondelete="CASCADE"), nullable=True, index=True)
    content = Column(String(2000), nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    author = relationship("User")
    parent = relationship("FeedComment", remote_side=[id], back_populates="replies")
    replies = relationship(
        "FeedComment",
        back_populates="parent",
        cascade="all, delete-orphan",
        order_by="FeedComment.created_at.asc()",
    )


class FeedReaction(Base):
    __tablename__ = "feed_reactions"
    __table_args__ = (UniqueConstraint("post_id", "user_id", "emoji", name="uq_feed_reaction_user_emoji"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("feed_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji = Column(String(16), nullable=False)
