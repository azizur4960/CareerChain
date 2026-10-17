from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import or_
from app.database import get_db
from app.models.blog import Blog
from app.models.user import User
from app.schemas.blog import BlogCreate, BlogUpdate, BlogResponse
from app.dependencies.auth_deps import get_current_user, get_current_alumni, get_optional_current_user

router = APIRouter(prefix="/blogs", tags=["Blogs"])


@router.get("", response_model=List[BlogResponse])
def get_blogs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve published career blogs and insights."""
    q = db.query(Blog).filter(Blog.is_published == True)
    if category:
        q = q.filter(Blog.category == category)
    if search:
        pattern = f"%{search}%"
        q = q.filter(or_(Blog.title.ilike(pattern), Blog.content.ilike(pattern)))
    return q.order_by(Blog.created_at.desc()).all()


@router.get("/my/posts", response_model=List[BlogResponse])
def get_my_blogs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Fetch blog posts authored by the logged-in user."""
    return db.query(Blog).filter(Blog.author_id == current_user.id).order_by(Blog.created_at.desc()).all()


@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog_by_id(
    blog_id: int,
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_current_user)
):
    """Fetch a single blog post by ID."""
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return blog


@router.post("", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
def create_blog(
    blog_in: BlogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Publish a new career blog article (Alumni or Admin)."""
    new_blog = Blog(
        **blog_in.model_dump(),
        author_id=current_user.id
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog


@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(
    blog_id: int,
    blog_in: BlogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Update a blog post."""
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    if blog.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this blog")

    for field, val in blog_in.model_dump(exclude_unset=True).items():
        setattr(blog, field, val)

    db.commit()
    db.refresh(blog)
    return blog


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_alumni)
):
    """Delete a blog post."""
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    if blog.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this blog")

    db.delete(blog)
    db.commit()
    return None
