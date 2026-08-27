from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str
    status: str
    chunk_count: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class AskRequest(BaseModel):
    query: str


class EvidenceItem(BaseModel):
    filename: str
    page: int
    score: float
    snippet: str


class AskResponse(BaseModel):
    answer: str
    evidence: list[EvidenceItem]
