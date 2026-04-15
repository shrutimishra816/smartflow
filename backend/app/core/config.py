from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SmartFlow"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./smartflow.db"  # fallback for local dev
    )

    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production-please")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS
    ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",       # default React dev server
    "http://localhost:5173",       # default Vite dev server
    "http://127.0.0.1:3000",       # localhost with IP for React
    "http://127.0.0.1:5173",       # localhost with IP for Vite
    "https://smartflow-frontend.onrender.com"  # deployed frontend URL
]

    # ML Models path
    ML_MODELS_PATH: str = os.getenv("ML_MODELS_PATH", "../ml/outputs/models")

    # Fitbit OAuth
    FITBIT_CLIENT_ID:     str = os.getenv("FITBIT_CLIENT_ID", "")
    FITBIT_CLIENT_SECRET: str = os.getenv("FITBIT_CLIENT_SECRET", "")
    FITBIT_REDIRECT_URI:  str = os.getenv("FITBIT_REDIRECT_URI", "http://localhost:8000/api/watch/fitbit/callback")

    # Google Fit OAuth
    GOOGLE_CLIENT_ID:     str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI:  str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/watch/googlefit/callback")

    # Frontend
    FRONTEND_URL:         str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    class Config:
        env_file = ".env"


settings = Settings()
