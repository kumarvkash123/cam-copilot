# CAM Copilot — Simplified 2-Screen POC

Two screens, three services. Upload PDFs → Start CAM (chunk + embed + store
in Postgres/pgvector) → ask questions about them, answered by Groq.

- **Dashboard** — matches the mockup layout; live counts of uploaded/processed documents.
- **CAM** — upload files, see status per file, click "Start CAM", then chat with the documents.

No Redis, no MinIO, no multi-provider switch this time — just Postgres, FastAPI, Next.js, and Groq, kept deliberately minimal.

---

## 1. Setup

```bash
cp .env.example .env
```
Edit `.env` and set your real key:
```
GROQ_API_KEY=gsk_...
```

```bash
docker compose up --build
```

Open:
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

No seeding needed — just upload a PDF from the CAM screen.

## 2. How it works

1. **Upload** (`POST /documents/upload`) — saves the PDF to local disk (`backend/uploads/`, a Docker volume) and creates a `documents` row with `status="uploaded"`.
2. **Start CAM** (`POST /documents/start-cam`) — processes every document still in `status="uploaded"`:
   - parses the PDF page by page
   - splits into ~700-word overlapping chunks
   - embeds each chunk (offline hashing embedding — Groq has no embeddings API)
   - stores chunks in the `chunks` table (Postgres + pgvector)
   - flips the document to `status="processed"`
3. **Ask** (`POST /documents/ask`) — embeds your question, finds the closest chunks across *all* processed documents via pgvector cosine distance, sends that evidence + your question to Groq, returns a grounded answer with the evidence attached.

The dashboard polls `/documents` for live status; the CAM page also polls every 3s so "Processing…" flips to "CAM Ready" without a manual refresh.

## 3. What's simplified vs. the fuller design

- Files are stored on local disk instead of MinIO/S3 — fine for a POC, swap in object storage before production.
- Embeddings are a deterministic offline hash, not a real embedding model — good enough to prove the pipeline; swap in a real embedding API when you care about retrieval quality.
- No auth yet — anyone hitting the API can upload/ask. Add before this touches real users.
- No multi-agent routing (RAG only) — the full multi-agent/LangGraph version from the earlier build can be layered back in once this simpler version is solid.
