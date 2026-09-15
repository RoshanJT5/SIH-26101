from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
    PydanticBaseSettingsSource,
)

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_ENV: str = "development"
    SECRET_KEY: str = "pragatiparikshan-secret-key-2026-production-ready"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    ENABLE_DEMO_ADMIN: bool = True
    MAX_UPLOAD_SIZE_MB: int = 25

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

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return init_settings, dotenv_settings, env_settings, file_secret_settings

settings = Settings()


