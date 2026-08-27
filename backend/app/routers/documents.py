from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.chunking import chunk_pages, extract_pdf_pages
from app.database import get_db
from app.embeddings import embed_texts
from app.groq_client import ask_groq
from app.models import Chunk, Document
from app.schemas import AskRequest, AskResponse, DocumentOut, EvidenceItem
from app.storage import read_file, save_file

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported right now.")

    file_bytes = await file.read()
    filepath = save_file(file.filename, file_bytes)

    document = Document(filename=file.filename, filepath=filepath, status="uploaded")
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    """Used by the frontend to show upload status for every file."""
    return db.execute(select(Document).order_by(Document.uploaded_at.desc())).scalars().all()


@router.post("/start-cam")
def start_cam(db: Session = Depends(get_db)):
    """
    Processes every document that hasn't been chunked yet:
    parse PDF -> chunk -> embed -> store chunks in Postgres (pgvector).
    """
    pending = db.execute(select(Document).where(Document.status == "uploaded")).scalars().all()

    if not pending:
        return {"message": "No new documents to process.", "processed": 0}

    processed = 0
    for doc in pending:
        doc.status = "processing"
        db.commit()

        try:
            file_bytes = read_file(doc.filepath)
            pages = extract_pdf_pages(file_bytes)
            raw_chunks = chunk_pages(pages)

            if not raw_chunks:
                doc.status = "failed"
                db.commit()
                continue

            vectors = embed_texts([c["content"] for c in raw_chunks])
            for raw, vec in zip(raw_chunks, vectors):
                db.add(Chunk(document_id=doc.id, page=raw["page"], content=raw["content"], embedding=vec))

            doc.status = "processed"
            doc.chunk_count = len(raw_chunks)
            db.commit()
            processed += 1
        except Exception as e:
            doc.status = "failed"
            db.commit()
            raise HTTPException(status_code=500, detail=f"Failed to process {doc.filename}: {e}")

    return {"message": f"Processed {processed} document(s).", "processed": processed}


@router.post("/ask", response_model=AskResponse)
def ask(payload: AskRequest, db: Session = Depends(get_db)):
    """RAG over every processed document: retrieve top matching chunks, ask Groq."""
    query_vec = embed_texts([payload.query])[0]

    distance_col = Chunk.embedding.cosine_distance(query_vec).label("distance")
    stmt = select(Chunk, Document.filename, distance_col).join(Document, Chunk.document_id == Document.id).order_by(distance_col).limit(6)
    rows = db.execute(stmt).all()

    if not rows:
        return AskResponse(answer="No processed documents yet — upload files and click 'Start CAM' first.", evidence=[])

    evidence_block = "\n\n".join(f"[{filename} p.{c.page}] {c.content}" for c, filename, _ in rows)

    answer = ask_groq(payload.query, evidence_block)

    evidence = [
        EvidenceItem(filename=filename, page=c.page, score=round(max(0.0, 1.0 - float(distance)), 3), snippet=c.content[:280])
        for c, filename, distance in rows
    ]

    return AskResponse(answer=answer, evidence=evidence)
