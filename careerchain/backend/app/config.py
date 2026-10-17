import secrets
from typing import List, Union
try:
    # pyrefly: ignore [missing-import]
    from pydantic_settings import BaseSettings
except ImportError:
    # pyrefly: ignore [missing-import]
    from pydantic import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerChain"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security
    # A per-process key keeps local development usable without a .env file.
    # Deployments must set SECRET_KEY to a stable, randomly generated value.
    SECRET_KEY: str = secrets.token_urlsafe(48)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Databases
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/careerchain_db"
    SQLITE_FALLBACK_URL: str = "sqlite:///./careerchain.db"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # AI / LLM Configuration
    LLM_API_KEY: str = ""
    LLM_PROVIDER: str = "local"

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return ["*"]

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
        "case_sensitive": True
    }


settings = Settings()
