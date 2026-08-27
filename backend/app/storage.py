import os
import uuid

from app.config import get_settings

settings = get_settings()


def save_file(filename: str, file_bytes: bytes) -> str:
    """Saves to local disk under uploads/. Returns the filepath."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{filename}"
    path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path


def read_file(filepath: str) -> bytes:
    with open(filepath, "rb") as f:
        return f.read()
