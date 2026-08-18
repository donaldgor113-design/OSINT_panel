import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, computed_field

QueryStatus = Literal["running", "completed"]


class QueryCreate(BaseModel):
    query_text: str
    query_type: str | None = None
    registry_id: uuid.UUID
    filters: dict[str, Any] | None = None


class QueryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    query_text: str
    query_type: str | None
    registry_id: uuid.UUID | None
    source_system: str | None
    result_count: int | None
    confidence_level: int | None
    tags: dict[str, Any] | None
    created_at: datetime
    executed_at: datetime | None
    completed_at: datetime | None
    execution_duration_ms: int | None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def status(self) -> QueryStatus:
        return "completed" if self.completed_at else "running"


class QueryDetail(QueryPublic):
    results: list[dict[str, Any]] = []


class QueryListResponse(BaseModel):
    items: list[QueryPublic]
    total_count: int
