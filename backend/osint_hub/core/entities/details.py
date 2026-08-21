import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.infrastructure.database.models import (
    AccountDetails,
    AssetDetails,
    ContactDetails,
    LegalEntityDetails,
    LocationDetails,
    PersonDetails,
    VehicleDetails,
)

DETAILS_MODEL_BY_TYPE: dict[str, type] = {
    "person": PersonDetails,
    "legal_entity": LegalEntityDetails,
    "vehicle": VehicleDetails,
    "location": LocationDetails,
    "account": AccountDetails,
    "contact": ContactDetails,
    "asset": AssetDetails,
}


def _allowed_fields(model: type) -> set[str]:
    return {c.name for c in model.__table__.columns if c.name != "entity_id"}


async def create_details(db: AsyncSession, entity_type: str, entity_id: uuid.UUID, details: dict[str, Any]) -> None:
    model = DETAILS_MODEL_BY_TYPE.get(entity_type)
    if model is None:
        return
    filtered = {k: v for k, v in details.items() if k in _allowed_fields(model)}
    db.add(model(entity_id=entity_id, **filtered))


async def get_details_dict(db: AsyncSession, entity_type: str, entity_id: uuid.UUID) -> dict[str, Any]:
    model = DETAILS_MODEL_BY_TYPE.get(entity_type)
    if model is None:
        return {}
    result = await db.execute(select(model).where(model.entity_id == entity_id))
    row = result.scalar_one_or_none()
    if row is None:
        return {}
    return {f: getattr(row, f) for f in _allowed_fields(model)}


async def update_details(db: AsyncSession, entity_type: str, entity_id: uuid.UUID, details: dict[str, Any]) -> None:
    model = DETAILS_MODEL_BY_TYPE.get(entity_type)
    if model is None:
        return
    result = await db.execute(select(model).where(model.entity_id == entity_id))
    row = result.scalar_one_or_none()
    filtered = {k: v for k, v in details.items() if k in _allowed_fields(model)}
    if row is None:
        db.add(model(entity_id=entity_id, **filtered))
    else:
        for k, v in filtered.items():
            setattr(row, k, v)
