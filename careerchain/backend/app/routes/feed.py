from collections import Counter
from io import BytesIO
from pathlib import Path
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from PIL import Image
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies.auth_deps import get_current_user
from app.models.feed import FeedComment, FeedPost, FeedReaction
from app.models.user import User
from app.schemas.feed import (
    FeedCommentCreate, FeedCommentResponse, FeedPostResponse,
    FeedPageResponse, FeedReactionCreate, FeedReactionResult, FeedReactionSummary,
)

router = APIRouter(prefix="/feed", tags=["Community Feed"])
ALLOWED_EMOJIS = {"👏", "🎉", "❤️", "👍", "💪", "😊"}
ALLOWED_POST_TYPES = {"UPDATE", "SUCCESS_STORY"}
MAX_IMAGE_SIZE = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 40_000_000
IMAGE_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
MEDIA_ROOT = Path(__file__).resolve().parents[2] / "media" / "community-images"


def _post_response(post: FeedPost, viewer_id: int) -> FeedPostResponse:
    counts = Counter(reaction.emoji for reaction in post.reactions)
    mine = {reaction.emoji for reaction in post.reactions if reaction.user_id == viewer_id}
    reactions = [
        FeedReactionSummary(emoji=emoji, count=counts[emoji], reacted_by_me=emoji in mine)
        for emoji in ALLOWED_EMOJIS if counts[emoji]
    ]
    return FeedPostResponse(
        id=post.id,
        content=post.content,
        image_url=post.image_url,
        post_type=post.post_type,
        created_at=post.created_at,
        author=post.author,
        comments=[comment for comment in post.comments if comment.parent_comment_id is None],
        reactions=reactions,
    )


@router.get("", response_model=FeedPageResponse)
def get_feed(
    cursor: Optional[int] = Query(default=None, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the newest community posts in stable, cursor-paginated batches."""
    query = db.query(FeedPost).filter(FeedPost.id < cursor) if cursor is not None else db.query(FeedPost)
    posts = (
        query
        .options(
            joinedload(FeedPost.author),
            joinedload(FeedPost.comments).joinedload(FeedComment.author),
            joinedload(FeedPost.comments).joinedload(FeedComment.replies).joinedload(FeedComment.author),
            joinedload(FeedPost.reactions),
        )
        .order_by(FeedPost.id.desc())
        .limit(page_size + 1)
        .all()
    )
    has_more = len(posts) > page_size
    posts = posts[:page_size]
    return {
        "posts": [_post_response(post, current_user.id) for post in posts],
        "next_cursor": posts[-1].id if has_more and posts else None,
    }


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(FeedPost).filter(FeedPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own posts")

    image_url = post.image_url
    db.delete(post)
    db.commit()

    if image_url and image_url.startswith("/media/community-images/"):
        filename = Path(image_url).name
        if filename == image_url.rsplit("/", 1)[-1]:
            (MEDIA_ROOT / filename).unlink(missing_ok=True)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("", response_model=FeedPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    content: str = Form(default="", max_length=5000),
    post_type: str = Form(default="UPDATE"),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post_type = post_type.upper()
    if post_type not in ALLOWED_POST_TYPES:
        raise HTTPException(status_code=400, detail="Post type must be UPDATE or SUCCESS_STORY")
    content = content.strip()
    if not content and not image:
        raise HTTPException(status_code=422, detail="Add some text or choose an image for your post")

    image_url = None
    if image:
        if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise HTTPException(status_code=415, detail="Choose a JPG, PNG, or WebP image")
        image_bytes = image.file.read(MAX_IMAGE_SIZE + 1)
        if len(image_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller")
        try:
            with Image.open(BytesIO(image_bytes)) as uploaded_image:
                image_format = uploaded_image.format
                if uploaded_image.width * uploaded_image.height > MAX_IMAGE_PIXELS:
                    raise ValueError("Image dimensions are too large")
                uploaded_image.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="The selected file is not a valid image")
        extension = IMAGE_FORMATS.get(image_format)
        if not extension:
            raise HTTPException(status_code=415, detail="Choose a JPG, PNG, or WebP image")
        MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
        filename = f"{secrets.token_hex(16)}{extension}"
        (MEDIA_ROOT / filename).write_bytes(image_bytes)
        image_url = f"/media/community-images/{filename}"

    post = FeedPost(author_id=current_user.id, content=content, image_url=image_url, post_type=post_type)
    db.add(post)
    try:
        db.commit()
    except Exception:
        db.rollback()
        if image_url:
            (MEDIA_ROOT / Path(image_url).name).unlink(missing_ok=True)
        raise
    post = (
        db.query(FeedPost)
        .options(
            joinedload(FeedPost.author),
            joinedload(FeedPost.comments).joinedload(FeedComment.author),
            joinedload(FeedPost.comments).joinedload(FeedComment.replies).joinedload(FeedComment.author),
            joinedload(FeedPost.reactions),
        )
        .filter(FeedPost.id == post.id)
        .first()
    )
    return _post_response(post, current_user.id)


@router.post("/{post_id}/comments", response_model=FeedCommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(post_id: int, payload: FeedCommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not payload.content.strip():
        raise HTTPException(status_code=422, detail="Comment cannot be empty")
    if not db.query(FeedPost.id).filter(FeedPost.id == post_id).first():
        raise HTTPException(status_code=404, detail="Feed post not found")
    if payload.parent_comment_id is not None:
        parent = db.query(FeedComment).filter(
            FeedComment.id == payload.parent_comment_id,
            FeedComment.post_id == post_id,
            FeedComment.parent_comment_id.is_(None),
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Comment to reply to was not found")
    comment = FeedComment(
        post_id=post_id,
        author_id=current_user.id,
        parent_comment_id=payload.parent_comment_id,
        content=payload.content.strip(),
    )
    db.add(comment)
    db.commit()
    return db.query(FeedComment).options(joinedload(FeedComment.author)).filter(FeedComment.id == comment.id).first()


@router.delete("/{post_id}/comments/{comment_id}", response_model=FeedCommentResponse)
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(FeedComment).filter(
        FeedComment.id == comment_id,
        FeedComment.post_id == post_id,
    ).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own comments")

    comment.content = ""
    comment.is_deleted = True
    db.commit()
    return (
        db.query(FeedComment)
        .options(joinedload(FeedComment.author), joinedload(FeedComment.replies).joinedload(FeedComment.author))
        .filter(FeedComment.id == comment_id)
        .first()
    )


@router.put("/{post_id}/reactions", response_model=FeedReactionResult)
def toggle_reaction(post_id: int, payload: FeedReactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.emoji not in ALLOWED_EMOJIS:
        raise HTTPException(status_code=400, detail="Unsupported reaction emoji")
    if not db.query(FeedPost.id).filter(FeedPost.id == post_id).first():
        raise HTTPException(status_code=404, detail="Feed post not found")
    reaction = db.query(FeedReaction).filter_by(post_id=post_id, user_id=current_user.id, emoji=payload.emoji).first()
    if reaction:
        db.delete(reaction)
        added = False
    else:
        db.add(FeedReaction(post_id=post_id, user_id=current_user.id, emoji=payload.emoji))
        added = True
    db.commit()
    return FeedReactionResult(added=added, emoji=payload.emoji)
