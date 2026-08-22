import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.routes.cases import _get_own_case_or_404
from osint_hub.api.routes.entities import _get_own_entity_or_404
from osint_hub.api.schemas.auth import SuccessResponse
from osint_hub.api.schemas.capture import CaptureAttachRequest, CaptureItemPublic
from osint_hub.config import get_settings
from osint_hub.core.storage.local_storage import save_upload
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import CaptureItem, EntityMedia, User

router = APIRouter(prefix="/capture", tags=["capture"])
settings = get_settings()


async def _get_own_item_or_404(db: AsyncSession, item_id: uuid.UUID, user: User) -> CaptureItem:
    result = await db.execute(select(CaptureItem).where(CaptureItem.id == item_id, CaptureItem.uploaded_by == user.id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "CAPTURE_ITEM_NOT_FOUND", "message": "Файл не знайдено"}},
        )
    return item


@router.post("/upload", response_model=CaptureItemPublic, status_code=status.HTTP_201_CREATED)
async def upload_capture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CaptureItem:
    stored_path, display_name, media_type, size_bytes = await save_upload(file)

    if size_bytes > settings.max_upload_size_mb * 1024 * 1024:
        Path(stored_path).unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"error": {"code": "FILE_TOO_LARGE", "message": f"Максимум {settings.max_upload_size_mb} МБ"}},
        )

    item = CaptureItem(
        uploaded_by=current_user.id,
        file_name=display_name,
        file_path=stored_path,
        media_type=media_type,
        file_size_bytes=size_bytes,
        status="pending",
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("", response_model=list[CaptureItemPublic])
async def list_capture_items(
    status_filter: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CaptureItem]:
    stmt = select(CaptureItem).where(CaptureItem.uploaded_by == current_user.id)
    if status_filter:
        stmt = stmt.where(CaptureItem.status == status_filter)
    stmt = stmt.order_by(CaptureItem.uploaded_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{item_id}/file")
async def get_capture_file(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    item = await _get_own_item_or_404(db, item_id, current_user)
    if not Path(item.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "FILE_MISSING", "message": "Файл відсутній на диску"}},
        )
    return FileResponse(item.file_path, filename=item.file_name)


@router.post("/{item_id}/attach", response_model=CaptureItemPublic)
async def attach_capture_item(
    item_id: uuid.UUID,
    payload: CaptureAttachRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CaptureItem:
    item = await _get_own_item_or_404(db, item_id, current_user)
    if item.status == "attached":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "ALREADY_ATTACHED", "message": "Файл уже прикріплено"}},
        )

    await _get_own_case_or_404(db, payload.case_id, current_user)
    entity = await _get_own_entity_or_404(db, payload.entity_id, current_user)
    if entity.case_id != payload.case_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "ENTITY_CASE_MISMATCH", "message": "Сутність не належить обраній справі"}},
        )

    item.status = "attached"
    item.case_id = payload.case_id
    item.entity_id = payload.entity_id
    item.attached_at = datetime.now(timezone.utc)

    db.add(
        EntityMedia(
            entity_id=payload.entity_id,
            file_name=item.file_name,
            file_path=item.file_path,
            media_type=item.media_type,
            uploaded_by=current_user.id,
        )
    )

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", response_model=SuccessResponse)
async def discard_capture_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    item = await _get_own_item_or_404(db, item_id, current_user)
    if item.status == "attached":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "ALREADY_ATTACHED", "message": "Прикріплений файл не можна видалити звідси"}},
        )

    Path(item.file_path).unlink(missing_ok=True)
    await db.delete(item)
    await db.commit()
    return SuccessResponse()
