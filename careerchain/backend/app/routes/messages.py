from typing import List, Any
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, ConversationResponse
from app.services.message_service import MessageService
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages & Networking"])


@router.get("/conversations", response_model=List[ConversationResponse])
def get_my_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all direct conversation threads for the current user."""
    return MessageService.get_user_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}", response_model=List[MessageResponse])
def get_conversation_history(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch chronological messages within a conversation and mark as read."""
    return MessageService.get_conversation_messages(db, conversation_id, current_user.id)


@router.post("/send", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_direct_message(
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a direct message to a student, alumni, or admin."""
    return MessageService.send_message(
        db=db,
        sender_id=current_user.id,
        recipient_id=msg_in.recipient_id,
        content=msg_in.content
    )
