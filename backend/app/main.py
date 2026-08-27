from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import documents


settings = get_settings()


app = FastAPI(
    title="CAM Copilot",
    description="Simplified 2-screen POC: upload docs, start CAM, ask questions",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(documents.router)


@app.on_event("startup")
def on_startup():

    # Create normal PostgreSQL tables.
    # Vector embeddings are now stored in Pinecone.
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "service": "CAM Copilot API",
        "status": "ok"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }