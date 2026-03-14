from pydantic_settings import BaseSettings
import json

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./triageiq.db"
    SECRET_KEY: str = "dev-secret-key"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"

    def get_cors_origins(self) -> list[str]:
        """Parse CORS_ORIGINS from comma-separated string or JSON array."""
        val = self.CORS_ORIGINS.strip()
        if val.startswith("["):
            return json.loads(val)
        return [origin.strip() for origin in val.split(",")]

settings = Settings()
