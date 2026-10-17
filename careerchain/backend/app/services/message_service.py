import datetime
from typing import List, Optional, Dict, Any
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import or_, and_
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
from app.models.message import Conversation, Message
from app.models.user import User


class MessageService:
    @staticmethod
    def _public_user(user: Optional[User]) -> Optional[Dict[str, Any]]:
        if user is None:
            return None
        return {
            "id": user.id,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department,
            "profile_image_url": user.profile_image_url,
        }

    @staticmethod
    def _public_message(message: Optional[Message]) -> Optional[Dict[str, Any]]:
        if message is None:
            return None
        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "created_at": message.created_at,
            "is_read": message.is_read,
            "sender": MessageService._public_user(message.sender),
        }

    @staticmethod
    def get_or_create_conversation(db: Session, user1_id: int, user2_id: int) -> Conversation:
        if user1_id == user2_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start a conversation with yourself"
            )

        # Check if conversation already exists in either direction
        conv = db.query(Conversation).filter(
            or_(
                and_(Conversation.participant1_id == user1_id, Conversation.participant2_id == user2_id),
                and_(Conversation.participant1_id == user2_id, Conversation.participant2_id == user1_id)
            )
        ).first()

        if not conv:
            conv = Conversation(
                participant1_id=user1_id,
                participant2_id=user2_id,
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow()
            )
            db.add(conv)
            db.commit()
            db.refresh(conv)

        return conv

    @staticmethod
    def send_message(db: Session, sender_id: int, recipient_id: int, content: str) -> Message:
        if not content.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content cannot be empty")
        
        # Verify recipient exists
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

        conv = MessageService.get_or_create_conversation(db, sender_id, recipient_id)
        
        message = Message(
            conversation_id=conv.id,
            sender_id=sender_id,
            content=content.strip(),
            created_at=datetime.datetime.utcnow(),
            is_read=False
        )
        db.add(message)
        conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def get_user_conversations(db: Session, user_id: int) -> List[Dict[str, Any]]:
        conversations = db.query(Conversation).filter(
            or_(
                Conversation.participant1_id == user_id,
                Conversation.participant2_id == user_id
            )
        ).order_by(Conversation.updated_at.desc()).all()

        results = []
        for conv in conversations:
            other_id = conv.participant2_id if conv.participant1_id == user_id else conv.participant1_id
            other_user = db.query(User).filter(User.id == other_id).first()
            
            # Fetch last message
            last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
            unread_count = db.query(Message).filter(
                Message.conversation_id == conv.id,
                Message.sender_id != user_id,
                Message.is_read == False
            ).count()

            results.append({
                "id": conv.id,
                "participant1_id": conv.participant1_id,
                "participant2_id": conv.participant2_id,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "participant1": MessageService._public_user(conv.participant1),
                "participant2": MessageService._public_user(conv.participant2),
                "other_user": MessageService._public_user(other_user),
                "last_message": MessageService._public_message(last_msg),
                "unread_count": unread_count
            })

        return results

    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: int, user_id: int) -> List[Message]:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        
        if conv.participant1_id != user_id and conv.participant2_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this conversation")

        # Mark all messages sent to user as read
        db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read == False
        ).update({"is_read": True})
        db.commit()

        return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
