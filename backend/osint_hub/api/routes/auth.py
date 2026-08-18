from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.api.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    SuccessResponse,
    UserPublic,
)
from osint_hub.config import get_settings
from osint_hub.dependencies import get_current_user
from osint_hub.infrastructure.database.connection import get_db
from osint_hub.infrastructure.database.models import Session as SessionModel
from osint_hub.infrastructure.database.models import User
from osint_hub.infrastructure.logging.audit_logger import log_event
from osint_hub.security.jwt import TokenError, create_access_token, create_refresh_token, decode_token, hash_token
from osint_hub.security.password import hash_password, validate_password_strength, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        await log_event(
            db,
            event_type="login",
            action="create",
            status="failure",
            error_message="Invalid credentials",
            details={"username": payload.username},
            ip_address=_client_ip(request),
            user_agent=request.headers.get("user-agent"),
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Неправильний логін або пароль"}},
        )

    access_token, _ = create_access_token(str(user.id))
    refresh_token, _ = create_refresh_token(str(user.id))

    session = SessionModel(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
        last_activity_at=datetime.now(timezone.utc),
    )
    db.add(session)

    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    await log_event(
        db,
        event_type="login",
        user_id=user.id,
        action="create",
        session_id=session.id,
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.post("/logout", response_model=SuccessResponse)
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    await db.execute(delete(SessionModel).where(SessionModel.user_id == current_user.id))
    await db.commit()

    await log_event(
        db,
        event_type="logout",
        user_id=current_user.id,
        action="delete",
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return SuccessResponse()


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)) -> RefreshResponse:
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"error": {"code": "INVALID_REFRESH_TOKEN", "message": "Недійсний refresh-токен"}},
    )

    try:
        token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    except TokenError as exc:
        raise invalid from exc

    result = await db.execute(
        select(SessionModel).where(SessionModel.token_hash == hash_token(payload.refresh_token))
    )
    session = result.scalar_one_or_none()

    if session is None or session.expires_at < datetime.now(timezone.utc):
        raise invalid

    if str(session.user_id) != token_payload.get("sub"):
        raise invalid

    session.last_activity_at = datetime.now(timezone.utc)
    await db.commit()

    access_token, _ = create_access_token(token_payload["sub"])
    return RefreshResponse(access_token=access_token)


@router.post("/change-password", response_model=SuccessResponse)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "INVALID_PASSWORD", "message": "Поточний пароль вказано невірно"}},
        )

    errors = validate_password_strength(payload.new_password)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "WEAK_PASSWORD", "message": "Пароль не відповідає вимогам", "details": {"errors": errors}}},
        )

    new_hash, new_salt = hash_password(payload.new_password)
    current_user.password_hash = new_hash
    current_user.password_salt = new_salt
    await db.commit()

    await log_event(
        db,
        event_type="password_change",
        user_id=current_user.id,
        action="update",
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return SuccessResponse()
