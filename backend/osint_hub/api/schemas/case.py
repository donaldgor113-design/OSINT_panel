import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseCreate(BaseModel):
    title: str
    description: str | None = None
    goal: str | None = None
    case_type: str | None = None


class CaseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    goal: str | None = None
    status: str | None = None
    classification: str | None = None


class CasePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    goal: str | None
    case_type: str | None
    status: str
    classification: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
