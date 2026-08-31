from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    # AI Config
    GROQ_API_KEY: str = "gsk_mock_key_for_now"
    GROQ_MODEL: str = "mixtral-8x7b-32768"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    
    # RAG Chunks Config
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150
    TOP_K: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
