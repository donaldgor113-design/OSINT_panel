import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class RegistryCreate(BaseModel):
    name: str
    description: str | None = None
    auth_type: str | None = None
    auth_data: dict[str, Any] | None = None
    base_url: str | None = None
    api_endpoint: str | None = None
    requires_vpn: bool = False
    requires_almaz: bool = False
    almaz_key_id: str | None = None
    rate_limit_requests: int | None = None
    rate_limit_period_seconds: int | None = None
    is_public: bool = False


class RegistryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    auth_type: str | None
    base_url: str | None
    api_endpoint: str | None
    requires_vpn: bool
    requires_almaz: bool
    is_active: bool
    is_public: bool
    last_tested_at: datetime | None
    is_healthy: bool | None
    created_at: datetime
    updated_at: datetime


class RegistryTestResponse(BaseModel):
    is_healthy: bool
    message: str


class RegistryQueryRequest(BaseModel):
    query_text: str
    filters: dict[str, Any] | None = None


class RegistryQueryResponse(BaseModel):
    query_id: uuid.UUID
    result_count: int
    results: list[dict[str, Any]]
    error: str | None = None
