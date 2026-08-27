from io import BytesIO

from pypdf import PdfReader


def extract_pdf_pages(file_bytes: bytes) -> list[tuple[int, str]]:
    reader = PdfReader(BytesIO(file_bytes))
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append((i, text))
    return pages


def chunk_pages(pages: list[tuple[int, str]], chunk_words: int = 700, overlap_words: int = 100) -> list[dict]:
    chunks = []
    for page_num, text in pages:
        words = text.split()
        if not words:
            continue
        start = 0
        while start < len(words):
            end = min(start + chunk_words, len(words))
            chunk_text = " ".join(words[start:end])
            if chunk_text.strip():
                chunks.append({"page": page_num, "content": chunk_text})
            if end == len(words):
                break
            start = end - overlap_words
    return chunks
