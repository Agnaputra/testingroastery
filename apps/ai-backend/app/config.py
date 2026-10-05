import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "52 Coffee & Roastery - AI Barista Microservice"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # OpenAI runs server-side only. Never expose this key through frontend env vars.
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    OPENAI_EMBEDDING_MODEL: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    EMBEDDING_DIMENSIONS: int = int(os.getenv("EMBEDDING_DIMENSIONS", "1536"))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "3"))
    
    # PostgreSQL + pgvector Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/testingroastery"
    )
    
    # Guardrails
    ENABLE_GUARDRAILS: bool = os.getenv("ENABLE_GUARDRAILS", "true").lower() == "true"
    RAGAS_EVALUATOR_MODEL: str = os.getenv("RAGAS_EVALUATOR_MODEL", "gpt-4.1-mini")
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://52coffee.id",
        "*",
    ]

settings = Settings()
