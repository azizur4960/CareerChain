import logging
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, inspect, text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import declarative_base, sessionmaker
# pyrefly: ignore [missing-import]
from sqlalchemy.exc import SQLAlchemyError
# pyrefly: ignore [missing-import]
from app.config import settings

logger = logging.getLogger("careerchain.database")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = settings.DATABASE_URL
SQLITE_URL = settings.SQLITE_FALLBACK_URL

engine = None
SessionLocal = None
Base = declarative_base()

def initialize_engine():
    global engine, SessionLocal
    # Try MySQL if specified
    if DATABASE_URL and DATABASE_URL.startswith("mysql"):
        try:
            logger.info("Attempting to connect to MySQL database...")
            test_engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3}
            )
            # Test connectivity
            with test_engine.connect() as conn:
                logger.info("Successfully connected to MySQL database!")
            engine = test_engine
        except Exception as e:
            logger.warning(
                f"MySQL connection failed ({e}). Falling back to SQLite database at {SQLITE_URL}..."
            )
            engine = create_engine(
                SQLITE_URL,
                connect_args={"check_same_thread": False}
            )
    else:
        # Default directly to SQLite or configured non-mysql database
        target_url = DATABASE_URL if DATABASE_URL else SQLITE_URL
        connect_args = {"check_same_thread": False} if "sqlite" in target_url else {}
        engine = create_engine(target_url, connect_args=connect_args)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine

# Initialize upon import
initialize_engine()

def get_db():
    """Dependency that provides a SQLAlchemy session per request."""
    if SessionLocal is None:
        initialize_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema_compatibility():
    """Apply small additive migrations required by existing local databases."""
    inspector = inspect(engine)
    migrations = {
        "users": {
            "is_identity_verified": "BOOLEAN NOT NULL DEFAULT 0",
            "profile_image_url": "VARCHAR(500)",
        },
        "jobs": {"referral_url": "VARCHAR(255)"},
        "feed_posts": {"image_url": "VARCHAR(500)"},
        "feed_comments": {
            "parent_comment_id": "INTEGER",
            "is_deleted": "BOOLEAN NOT NULL DEFAULT 0",
        },
    }
    for table, additions in migrations.items():
        if table not in inspector.get_table_names():
            continue
        columns = {column["name"] for column in inspector.get_columns(table)}
        for column, definition in additions.items():
            if column not in columns:
                with engine.begin() as connection:
                    connection.execute(text(
                        f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
                    ))
                columns.add(column)
