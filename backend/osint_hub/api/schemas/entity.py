import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict

EntityType = Literal["person", "legal_entity", "vehicle", "location", "account", "contact", "asset"]
Confidence = Literal["confirmed", "probable", "unverified"]


class EntityCreate(BaseModel):
    entity_type: EntityType
    display_name: str
    confidence: Confidence = "unverified"
    details: dict[str, Any] = {}
    source_module: str | None = None
    source_name: str | None = None
    query_id: uuid.UUID | None = None


class EntityUpdate(BaseModel):
    display_name: str | None = None
    confidence: Confidence | None = None
    details: dict[str, Any] | None = None
    source_module: str | None = None
    source_name: str | None = None
    query_id: uuid.UUID | None = None


class EntityPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID | None
    entity_type: EntityType
    display_name: str
    confidence: Confidence
    created_at: datetime
    updated_at: datetime


class EntityDetail(EntityPublic):
    details: dict[str, Any] = {}
    media_count: int = 0


class RelationshipCreate(BaseModel):
    source_entity_id: uuid.UUID
    target_entity_id: uuid.UUID
    relationship_type: str
    description: str | None = None
    confidence: Confidence = "unverified"


class RelationshipPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    source_entity_id: uuid.UUID
    target_entity_id: uuid.UUID
    relationship_type: str
    description: str | None
    confidence: Confidence
    created_at: datetime


class EventCreate(BaseModel):
    entity_id: uuid.UUID | None = None
    event_date: datetime | None = None
    title: str
    description: str | None = None
    confidence: Confidence = "unverified"


class EventPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID
    entity_id: uuid.UUID | None
    event_date: datetime | None
    title: str
    description: str | None
    confidence: Confidence
    created_at: datetime
