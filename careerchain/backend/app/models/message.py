import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    participant1_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    participant2_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    participant1 = relationship("User", foreign_keys=[participant1_id])
    participant2 = relationship("User", foreign_keys=[participant2_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at.asc()")

    def __repr__(self):
        return f"<Conversation id={self.id} p1={self.participant1_id} p2={self.participant2_id}>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")

    def __repr__(self):
        return f"<Message id={self.id} conv={self.conversation_id} sender={self.sender_id}>"
