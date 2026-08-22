import uuid
from pathlib import Path

from fastapi import UploadFile

from osint_hub.config import get_settings

_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".heic"}
_VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
_DOC_EXT = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv"}


def _media_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext in _IMAGE_EXT:
        return "image"
    if ext in _VIDEO_EXT:
        return "video"
    if ext in _DOC_EXT:
        return "document"
    return "other"


def _safe_name(filename: str) -> str:
    return Path(filename).name  # strips any directory components, blocks path traversal


async def save_upload(file: UploadFile) -> tuple[str, str, str, int]:
    """Persist an uploaded file to local storage.

    Returns (stored_relative_path, display_file_name, media_type, size_bytes).
    """
    settings = get_settings()
    storage_root = Path(settings.storage_dir)
    storage_root.mkdir(parents=True, exist_ok=True)

    display_name = _safe_name(file.filename or "upload")
    ext = Path(display_name).suffix
    stored_name = f"{uuid.uuid4()}{ext}"
    stored_path = storage_root / stored_name

    contents = await file.read()
    stored_path.write_bytes(contents)

    return str(stored_path), display_name, _media_type(display_name), len(contents)
