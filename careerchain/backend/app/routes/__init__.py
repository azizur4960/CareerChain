"""CareerChain API Routes Package"""
from app.routes.auth import router as auth_router
from app.routes.students import router as students_router
from app.routes.alumni import router as alumni_router
from app.routes.jobs import router as jobs_router
from app.routes.ai import router as ai_router
from app.routes.blogs import router as blogs_router
from app.routes.events import router as events_router
from app.routes.messages import router as messages_router
from app.routes.admin import router as admin_router
from app.routes.feed import router as feed_router

__all__ = [
    "auth_router",
    "students_router",
    "alumni_router",
    "jobs_router",
    "ai_router",
    "blogs_router",
    "events_router",
    "messages_router",
    "admin_router",
    "feed_router",
]
