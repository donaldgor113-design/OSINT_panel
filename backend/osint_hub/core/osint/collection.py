import json
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from osint_hub.infrastructure.database.models import Query, Registry
from osint_hub.integrations.registries import get_adapter
from osint_hub.integrations.registries.base import AdapterNotConfigured
from osint_hub.security.secrets import decrypt_secret, encrypt_secret


def load_registry_credentials(registry: Registry) -> dict[str, Any]:
    if not registry.auth_data_encrypted:
        return {}
    return json.loads(decrypt_secret(registry.auth_data_encrypted))


async def run_registry_query(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    registry: Registry,
    query_text: str,
    query_type: str | None = None,
    filters: dict[str, Any] | None = None,
) -> Query:
    started_at = datetime.now(timezone.utc)

    query = Query(
        user_id=user_id,
        query_text=query_text,
        query_type=query_type,
        registry_id=registry.id,
        source_system=registry.name,
        executed_at=started_at,
    )
    db.add(query)
    await db.flush()

    try:
        adapter = get_adapter(registry, load_registry_credentials(registry))
        outcome = await adapter.search(query_text, filters)
        query.result_data_encrypted = encrypt_secret(json.dumps(outcome.results))
        query.result_count = outcome.raw_count
    except AdapterNotConfigured as exc:
        query.result_count = 0
        query.tags = {"error": str(exc)}
    except Exception as exc:  # noqa: BLE001 - collection failures must not crash the request, just be recorded
        query.result_count = 0
        query.tags = {"error": f"{type(exc).__name__}: {exc}"}

    completed_at = datetime.now(timezone.utc)
    query.completed_at = completed_at
    query.execution_duration_ms = int((completed_at - started_at).total_seconds() * 1000)

    await db.commit()
    await db.refresh(query)
    return query
