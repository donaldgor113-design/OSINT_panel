import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class TemplateFieldPublic(BaseModel):
    entity_type: str
    field_key: str
    label: str
    required: bool


class ReportTemplatePublic(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    primary_entity_type: str | None
    primary_fields: list[TemplateFieldPublic]
    related_sections: list[dict[str, str]]


class ReportCreate(BaseModel):
    template_id: str
    primary_entity_id: uuid.UUID | None = None
    title: str | None = None


class ReportUpdate(BaseModel):
    title: str | None = None
    status: str | None = None


class ReportPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID
    primary_entity_id: uuid.UUID | None
    template_id: str
    title: str
    status: str
    missing_fields: list[str] | None
    exported_formats: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime


class ReportDetail(ReportPublic):
    content_html: str | None
