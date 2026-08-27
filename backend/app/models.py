import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=gen_uuid
    )

    filename: Mapped[str] = mapped_column(String)

    filepath: Mapped[str] = mapped_column(String)

    # uploaded -> processing -> processed -> failed
    status: Mapped[str] = mapped_column(
        String,
        default="uploaded"
    )

    chunk_count: Mapped[int] = mapped_column(
        default=0
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    chunks: Mapped[list["Chunk"]] = relationship(
        back_populates="document",
        cascade="all, delete-orphan"
    )


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=gen_uuid
    )

    document_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("documents.id"),
        index=True
    )

    page: Mapped[int] = mapped_column(
        default=0
    )

    content: Mapped[str] = mapped_column(
        Text
    )

    # Pinecone vector ID
    pinecone_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=True,
        index=True
    )

    document: Mapped["Document"] = relationship(
        back_populates="chunks"
    )