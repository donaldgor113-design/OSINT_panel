import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.routes.cases import _get_own_case_or_404
from osint_hub.api.schemas.entity import (
    EntityCreate,
    EntityDetail,
    EntityUpdate,
    EventCreate,
    EventPublic,
    RelationshipCreate,
    RelationshipPublic,
)
from osint_hub.core.entities.details import create_details, get_details_dict, update_details
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import Entity, Event, FieldProvenance, Relationship, User

router = APIRouter(tags=["entities"])


async def _entity_to_detail(db: AsyncSession, entity: Entity) -> EntityDetail:
    details = await get_details_dict(db, entity.entity_type, entity.id)
    return EntityDetail(**EntityDetail.model_validate(entity).model_dump(exclude={"details"}), details=details)


async def _get_own_entity_or_404(db: AsyncSession, entity_id: uuid.UUID, user: User) -> Entity:
    result = await db.execute(
        select(Entity).join(Entity.case).where(Entity.id == entity_id, Entity.case.has(user_id=user.id))
    )
    entity = result.scalar_one_or_none()
    if entity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ENTITY_NOT_FOUND", "message": "Сутність не знайдено"}},
        )
    return entity


@router.post("/cases/{case_id}/entities", response_model=EntityDetail, status_code=status.HTTP_201_CREATED)
async def create_entity(
    case_id: uuid.UUID,
    payload: EntityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EntityDetail:
    await _get_own_case_or_404(db, case_id, current_user)

    entity = Entity(
        case_id=case_id,
        entity_type=payload.entity_type,
        display_name=payload.display_name,
        confidence=payload.confidence,
    )
    db.add(entity)
    await db.flush()

    await create_details(db, payload.entity_type, entity.id, payload.details)

    if payload.details:
        db.add(
            FieldProvenance(
                entity_id=entity.id,
                field_name=",".join(payload.details.keys()),
                source_module=payload.source_module or "manual",
                source_name=payload.source_name,
                retrieved_at=datetime.now(timezone.utc),
                retrieved_by=current_user.id,
                confidence=payload.confidence,
            )
        )

    await db.commit()
    await db.refresh(entity)
    return await _entity_to_detail(db, entity)


@router.get("/cases/{case_id}/entities", response_model=list[EntityDetail])
async def list_entities(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[EntityDetail]:
    await _get_own_case_or_404(db, case_id, current_user)
    result = await db.execute(select(Entity).where(Entity.case_id == case_id).order_by(Entity.created_at))
    entities = result.scalars().all()
    return [await _entity_to_detail(db, e) for e in entities]


@router.get("/entities/{entity_id}", response_model=EntityDetail)
async def get_entity(
    entity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EntityDetail:
    entity = await _get_own_entity_or_404(db, entity_id, current_user)
    return await _entity_to_detail(db, entity)


@router.patch("/entities/{entity_id}", response_model=EntityDetail)
async def update_entity(
    entity_id: uuid.UUID,
    payload: EntityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EntityDetail:
    entity = await _get_own_entity_or_404(db, entity_id, current_user)

    if payload.display_name is not None:
        entity.display_name = payload.display_name
    if payload.confidence is not None:
        entity.confidence = payload.confidence
    if payload.details:
        await update_details(db, entity.entity_type, entity.id, payload.details)

    await db.commit()
    await db.refresh(entity)
    return await _entity_to_detail(db, entity)


@router.delete("/entities/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entity(
    entity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    entity = await _get_own_entity_or_404(db, entity_id, current_user)
    await db.delete(entity)
    await db.commit()


@router.post("/relationships", response_model=RelationshipPublic, status_code=status.HTTP_201_CREATED)
async def create_relationship(
    payload: RelationshipCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Relationship:
    await _get_own_entity_or_404(db, payload.source_entity_id, current_user)
    await _get_own_entity_or_404(db, payload.target_entity_id, current_user)

    rel = Relationship(
        source_entity_id=payload.source_entity_id,
        target_entity_id=payload.target_entity_id,
        relationship_type=payload.relationship_type,
        description=payload.description,
        confidence=payload.confidence,
    )
    db.add(rel)
    await db.commit()
    await db.refresh(rel)
    return rel


@router.get("/cases/{case_id}/relationships", response_model=list[RelationshipPublic])
async def list_case_relationships(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Relationship]:
    await _get_own_case_or_404(db, case_id, current_user)
    result = await db.execute(
        select(Relationship).join(Entity, Relationship.source_entity_id == Entity.id).where(Entity.case_id == case_id)
    )
    return list(result.scalars().all())


@router.post("/cases/{case_id}/events", response_model=EventPublic, status_code=status.HTTP_201_CREATED)
async def create_event(
    case_id: uuid.UUID,
    payload: EventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Event:
    await _get_own_case_or_404(db, case_id, current_user)
    event = Event(
        case_id=case_id,
        entity_id=payload.entity_id,
        event_date=payload.event_date,
        title=payload.title,
        description=payload.description,
        confidence=payload.confidence,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/cases/{case_id}/events", response_model=list[EventPublic])
async def list_events(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Event]:
    await _get_own_case_or_404(db, case_id, current_user)
    result = await db.execute(select(Event).where(Event.case_id == case_id).order_by(Event.event_date))
    return list(result.scalars().all())
