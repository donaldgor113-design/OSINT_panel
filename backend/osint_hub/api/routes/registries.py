import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.schemas.registry import (
    RegistryCreate,
    RegistryPublic,
    RegistryQueryRequest,
    RegistryQueryResponse,
    RegistryTestResponse,
)
from osint_hub.core.osint.collection import load_registry_credentials, run_registry_query
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import Registry, User
from osint_hub.integrations.registries import get_adapter
from osint_hub.security.secrets import decrypt_secret, encrypt_secret

router = APIRouter(prefix="/registries", tags=["registries"])


async def _get_registry_or_404(db: AsyncSession, registry_id: uuid.UUID) -> Registry:
    result = await db.execute(select(Registry).where(Registry.id == registry_id))
    registry = result.scalar_one_or_none()
    if registry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "REGISTRY_NOT_FOUND", "message": "Реєстр не знайдено"}},
        )
    return registry


@router.get("", response_model=list[RegistryPublic])
async def list_registries(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Registry]:
    result = await db.execute(select(Registry).order_by(Registry.name))
    return list(result.scalars().all())


@router.post("", response_model=RegistryPublic, status_code=status.HTTP_201_CREATED)
async def create_registry(
    payload: RegistryCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Registry:
    registry = Registry(
        name=payload.name,
        description=payload.description,
        auth_type=payload.auth_type,
        auth_data_encrypted=encrypt_secret(json.dumps(payload.auth_data)) if payload.auth_data else None,
        base_url=payload.base_url,
        api_endpoint=payload.api_endpoint,
        requires_vpn=payload.requires_vpn,
        requires_almaz=payload.requires_almaz,
        almaz_key_id=payload.almaz_key_id,
        rate_limit_requests=payload.rate_limit_requests,
        rate_limit_period_seconds=payload.rate_limit_period_seconds,
        is_public=payload.is_public,
    )
    db.add(registry)
    await db.commit()
    await db.refresh(registry)
    return registry


@router.post("/{registry_id}/test", response_model=RegistryTestResponse)
async def test_registry(
    registry_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RegistryTestResponse:
    registry = await _get_registry_or_404(db, registry_id)

    adapter = get_adapter(registry, load_registry_credentials(registry))
    result = await adapter.test_connection()

    registry.last_tested_at = datetime.now(timezone.utc)
    registry.is_healthy = result.is_healthy
    await db.commit()

    return RegistryTestResponse(is_healthy=result.is_healthy, message=result.message)


@router.post("/{registry_id}/query", response_model=RegistryQueryResponse)
async def query_registry(
    registry_id: uuid.UUID,
    payload: RegistryQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RegistryQueryResponse:
    registry = await _get_registry_or_404(db, registry_id)

    query = await run_registry_query(
        db,
        user_id=current_user.id,
        registry=registry,
        query_text=payload.query_text,
        filters=payload.filters,
    )

    results = json.loads(decrypt_secret(query.result_data_encrypted)) if query.result_data_encrypted else []
    return RegistryQueryResponse(query_id=query.id, result_count=query.result_count or 0, results=results)
