# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, File, HTTPException, status, Request, UploadFile
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from io import BytesIO
from pathlib import Path
import uuid
from typing import Optional
import smtplib
import logging
from email.message import EmailMessage
from urllib.parse import urlencode
# pyrefly: ignore [missing-import]
from PIL import Image, ImageOps, UnidentifiedImageError
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, Token, PasswordResetRequest, PasswordResetConfirm, PasswordResetByUniversityId
from app.config import settings
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.dependencies.auth_deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


@router.post("/reset-password/verify")
def reset_password_with_verification(request_data: PasswordResetByUniversityId, db: Session = Depends(get_db)):
    """Reset a password after matching the account email and university ID."""
    AuthService.reset_password_with_university_id(
        db, request_data.email, request_data.university_id, request_data.new_password
    )
    return {"message": "Password updated. You can now sign in."}


def _send_password_reset_email(email: str, token: str) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        raise HTTPException(status_code=503, detail="Password reset email is not configured. Please contact support.")
    link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?{urlencode({'token': token})}"
    message = EmailMessage()
    message["Subject"] = "Reset your CareerChain password"
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = email
    message.set_content(f"Use this link to reset your CareerChain password. It expires in 30 minutes.\n\n{link}\n\nIf you did not request this, you can ignore this email.")
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as error:
        logger.warning("Password reset email delivery failed: %s", error)


@router.post("/forgot-password")
def forgot_password(request_data: PasswordResetRequest, db: Session = Depends(get_db)):
    """Send a short-lived password reset link without revealing whether an account exists."""
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        raise HTTPException(status_code=503, detail="Password reset email is not configured. Please contact support.")
    user = db.query(User).filter(User.email == request_data.email.lower()).first()
    if user:
        _send_password_reset_email(user.email, AuthService.create_password_reset_token(user))
    return {"message": "If an account exists for that email, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(request_data: PasswordResetConfirm, db: Session = Depends(get_db)):
    AuthService.reset_password(db, request_data.token, request_data.new_password)
    return {"message": "Your password has been reset. You can now sign in."}

MAX_AVATAR_BYTES = 5 * 1024 * 1024
MAX_AVATAR_PIXELS = 40_000_000
MEDIA_ROOT = Path(__file__).resolve().parents[2] / "media"
AVATAR_DIRECTORY = MEDIA_ROOT / "profile-images"
AVATAR_DIRECTORY.mkdir(parents=True, exist_ok=True)


def _delete_avatar_file(image_url: Optional[str]) -> None:
    if not image_url or not image_url.startswith("/media/profile-images/"):
        return
    filename = Path(image_url).name
    if filename and filename == image_url.rsplit("/", 1)[-1]:
        (AVATAR_DIRECTORY / filename).unlink(missing_ok=True)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new student, alumni, or admin user."""
    user = AuthService.register_user(db, user_data)
    token_dict = AuthService.generate_token_for_user(user)
    return token_dict


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and issue JWT Bearer token.
    Supports standard JSON body ({email, password}) as well as form-data OAuth2 password flow.
    """
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        credentials = UserLogin(email=body.get("email") or body.get("username"), password=body.get("password"))
    else:
        form = await request.form()
        credentials = UserLogin(email=form.get("username") or form.get("email"), password=form.get("password"))

    user = AuthService.authenticate_user(db, credentials)
    token_dict = AuthService.generate_token_for_user(user)
    return token_dict


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_my_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Validate and store a normalized profile photo for the signed-in account."""
    content = await avatar.read(MAX_AVATAR_BYTES + 1)
    if not content:
        raise HTTPException(status_code=422, detail="Choose an image to upload.")
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=413, detail="Profile photos must be 5 MB or smaller.")

    try:
        with Image.open(BytesIO(content)) as source:
            image_format = source.format
            width, height = source.size
            if image_format not in {"JPEG", "PNG", "WEBP"}:
                raise ValueError("Use a JPEG, PNG, or WebP image.")
            if width * height > MAX_AVATAR_PIXELS:
                raise ValueError("Image dimensions are too large.")
            if getattr(source, "n_frames", 1) != 1:
                raise ValueError("Animated images are not supported.")
            source.verify()

        with Image.open(BytesIO(content)) as source:
            normalized = ImageOps.fit(source.convert("RGB"), (512, 512), method=Image.Resampling.LANCZOS)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=422, detail="This image could not be read. Choose a valid JPEG, PNG, or WebP.") from error

    filename = f"{current_user.id}-{uuid.uuid4().hex}.jpg"
    destination = AVATAR_DIRECTORY / filename
    previous_url = current_user.profile_image_url
    try:
        normalized.save(destination, format="JPEG", quality=88, optimize=True)
        current_user.profile_image_url = f"/media/profile-images/{filename}"
        db.commit()
        db.refresh(current_user)
    except Exception as error:
        db.rollback()
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Profile photo could not be saved.") from error

    _delete_avatar_file(previous_url)
    return current_user


@router.delete("/me/avatar", response_model=UserResponse)
def remove_my_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove the signed-in user's profile photo."""
    previous_url = current_user.profile_image_url
    current_user.profile_image_url = None
    db.commit()
    db.refresh(current_user)
    _delete_avatar_file(previous_url)
    return current_user
