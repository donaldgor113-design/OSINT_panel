import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.infrastructure.database.models import AuditLog


async def log_event(
    db: AsyncSession,
    *,
    event_type: str,
    user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    resource_id: uuid.UUID | None = None,
    action: str | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    session_id: uuid.UUID | None = None,
    status: str = "success",
    error_message: str | None = None,
) -> None:
    entry = AuditLog(
        event_type=event_type,
        user_id=user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id,
        status=status,
        error_message=error_message,
    )
    db.add(entry)
    await db.commit()
