import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.schemas.case import CaseCreate, CasePublic, CaseUpdate
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import Case, User

router = APIRouter(prefix="/cases", tags=["cases"])


async def _get_own_case_or_404(db: AsyncSession, case_id: uuid.UUID, user: User) -> Case:
    result = await db.execute(select(Case).where(Case.id == case_id, Case.user_id == user.id))
    case = result.scalar_one_or_none()
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "CASE_NOT_FOUND", "message": "Справу не знайдено"}},
        )
    return case


@router.post("", response_model=CasePublic, status_code=status.HTTP_201_CREATED)
async def create_case(
    payload: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Case:
    case = Case(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        goal=payload.goal,
        case_type=payload.case_type,
    )
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return case


@router.get("", response_model=list[CasePublic])
async def list_cases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = None,
) -> list[Case]:
    stmt = select(Case).where(Case.user_id == current_user.id)
    if status_filter:
        stmt = stmt.where(Case.status == status_filter)
    stmt = stmt.order_by(Case.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{case_id}", response_model=CasePublic)
async def get_case(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Case:
    return await _get_own_case_or_404(db, case_id, current_user)


@router.patch("/{case_id}", response_model=CasePublic)
async def update_case(
    case_id: uuid.UUID,
    payload: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Case:
    case = await _get_own_case_or_404(db, case_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(case, field, value)
    await db.commit()
    await db.refresh(case)
    return case
