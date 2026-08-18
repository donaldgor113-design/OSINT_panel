import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query as QueryParam, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.schemas.auth import SuccessResponse
from osint_hub.api.schemas.query import QueryCreate, QueryDetail, QueryListResponse, QueryPublic
from osint_hub.core.osint.collection import run_registry_query
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import Query, Registry, User
from osint_hub.security.secrets import decrypt_secret

router = APIRouter(prefix="/queries", tags=["queries"])


def _decrypt_results(query: Query) -> list[dict]:
    if not query.result_data_encrypted:
        return []
    return json.loads(decrypt_secret(query.result_data_encrypted))


async def _get_own_query_or_404(db: AsyncSession, query_id: uuid.UUID, user: User) -> Query:
    result = await db.execute(select(Query).where(Query.id == query_id, Query.user_id == user.id))
    query = result.scalar_one_or_none()
    if query is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "QUERY_NOT_FOUND", "message": "Запит не знайдено"}},
        )
    return query


@router.post("", response_model=QueryDetail, status_code=status.HTTP_201_CREATED)
async def create_query(
    payload: QueryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QueryDetail:
    result = await db.execute(select(Registry).where(Registry.id == payload.registry_id))
    registry = result.scalar_one_or_none()
    if registry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "REGISTRY_NOT_FOUND", "message": "Реєстр не знайдено"}},
        )

    query = await run_registry_query(
        db,
        user_id=current_user.id,
        registry=registry,
        query_text=payload.query_text,
        query_type=payload.query_type,
        filters=payload.filters,
    )

    return QueryDetail(**QueryPublic.model_validate(query).model_dump(), results=_decrypt_results(query))


@router.get("/{query_id}", response_model=QueryDetail)
async def get_query(
    query_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QueryDetail:
    query = await _get_own_query_or_404(db, query_id, current_user)
    return QueryDetail(**QueryPublic.model_validate(query).model_dump(), results=_decrypt_results(query))


@router.get("", response_model=QueryListResponse)
async def list_queries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    source_system: str | None = None,
    created_after: datetime | None = None,
    limit: int = QueryParam(default=50, ge=1, le=200),
    offset: int = QueryParam(default=0, ge=0),
) -> QueryListResponse:
    stmt = select(Query).where(Query.user_id == current_user.id)
    count_stmt = select(func.count()).select_from(Query).where(Query.user_id == current_user.id)

    if source_system:
        stmt = stmt.where(Query.source_system == source_system)
        count_stmt = count_stmt.where(Query.source_system == source_system)
    if created_after:
        stmt = stmt.where(Query.created_at >= created_after)
        count_stmt = count_stmt.where(Query.created_at >= created_after)

    stmt = stmt.order_by(Query.created_at.desc()).limit(limit).offset(offset)

    items = (await db.execute(stmt)).scalars().all()
    total_count = (await db.execute(count_stmt)).scalar_one()

    return QueryListResponse(
        items=[QueryPublic.model_validate(q) for q in items],
        total_count=total_count,
    )


@router.delete("/{query_id}", response_model=SuccessResponse)
async def delete_query(
    query_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    query = await _get_own_query_or_404(db, query_id, current_user)
    await db.delete(query)
    await db.commit()
    return SuccessResponse()
