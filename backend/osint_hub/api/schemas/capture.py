import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaptureItemPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    file_name: str
    media_type: str | None
    file_size_bytes: int | None
    notes: str | None
    status: str
    case_id: uuid.UUID | None
    entity_id: uuid.UUID | None
    uploaded_at: datetime
    attached_at: datetime | None


class CaptureAttachRequest(BaseModel):
    case_id: uuid.UUID
    entity_id: uuid.UUID
