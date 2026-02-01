"""
Crypto Tracker Backend - Configuration

Application configuration using Pydantic Settings.
Loads environment variables from .env file.
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "Crypto Tracker API"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",      # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:8000",      # FastAPI docs
    ]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/crypto_tracker"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 300  # 5 minutes default cache
    
    # External APIs
    COINGECKO_API_URL: str = "https://api.coingecko.com/api/v3"
    COINGECKO_API_KEY: str = ""  # Optional, for pro API
    
    # JWT Authentication
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_CALLS_PER_MINUTE: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create a global settings instance
settings = Settings()
