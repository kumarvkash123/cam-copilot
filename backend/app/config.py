from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    # ============================================================
    # GROQ
    # ============================================================

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"


    # ============================================================
    # POSTGRESQL
    # ============================================================
    # Keep PostgreSQL for:
    # - users
    # - proposals
    # - documents
    # - metadata
    # - chunk text
    # - CAM information
    #
    # Vector data will be stored in Pinecone.

    DATABASE_URL: str = (
        "postgresql+psycopg://cam_user:cam_password@"
        "localhost:5432/cam_db"
    )


    # ============================================================
    # PINECONE
    # ============================================================

    PINECONE_API_KEY: str = "pcsk_4qCmeJ_LTywDTiRZ5KEbGqe4y6Y955rQXEqnU2HMgAUeUhHX4fjjNy12mxkJmnbCUEetcZ"
    PINECONE_INDEX_NAME: str = "cam-index"
    PINECONE_NAMESPACE: str = "cam"


    # ============================================================
    # EMBEDDING
    # ============================================================

    # Keep this ONLY if your embedding model produces 768 dimensions.
    EMBEDDING_DIM: int = 768


    # ============================================================
    # FILE UPLOAD
    # ============================================================

    UPLOAD_DIR: str = "uploads"


    # ============================================================
    # CORS
    # ============================================================

    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()