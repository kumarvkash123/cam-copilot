"""
Groq has no embeddings API, so we use a deterministic offline hashing
embedding purely to power vector search inside Postgres/pgvector.
Chat/answers still come from Groq — this is only for retrieval.
"""
import hashlib

import numpy as np

from app.config import get_settings

settings = get_settings()


def _embed_one(text: str, dim: int) -> list[float]:
    vec = np.zeros(dim, dtype=np.float32)
    for tok in text.lower().split():
        h = int(hashlib.md5(tok.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h // dim) % 2 == 0 else -1.0
        vec[idx] += sign
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [_embed_one(t, settings.EMBEDDING_DIM) for t in texts]
