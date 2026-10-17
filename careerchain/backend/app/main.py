import logging
from pathlib import Path
from contextlib import asynccontextmanager
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, ensure_schema_compatibility
# Import all models to ensure metadata registration
import app.models
from app.routes import (
    auth_router,
    students_router,
    alumni_router,
    jobs_router,
    ai_router,
    blogs_router,
    events_router,
    messages_router,
    admin_router,
    feed_router,
)

logger = logging.getLogger("careerchain.main")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        ensure_schema_compatibility()
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.exception("Database initialization failed")
        raise RuntimeError("Database initialization failed; refusing to start") from e
    yield
    # Shutdown logic if any
    logger.info("CareerChain Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareerChain - AI-Powered Alumni–Student Networking and Career Guidance Platform for Daffodil International University (DIU)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

media_root = Path(__file__).resolve().parents[1] / "media"
media_root.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_root)), name="media")

# CORS Middleware
origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers Registration
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(alumni_router, prefix=settings.API_V1_STR)
app.include_router(jobs_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(blogs_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(messages_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(feed_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    from sqlalchemy import text

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {
        "status": "healthy",
        "database": engine.name if engine else "unknown",
        "version": settings.VERSION
    }
