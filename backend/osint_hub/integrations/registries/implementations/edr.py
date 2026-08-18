from datetime import datetime, timezone
from typing import Any

from osint_hub.integrations.registries.base import AdapterHealthCheck, AdapterSearchResult, RegistryAdapter


class EdrAdapter(RegistryAdapter):
    """EDR (Unified State Register of legal entities) registry adapter.

    STUB: no real EDR credentials/endpoint are configured. `search()` returns
    clearly-labeled simulated demo records so the collection pipeline (query ->
    normalize -> store) can be exercised end-to-end. Replace with a real
    API integration once credentials are available.
    """

    async def test_connection(self) -> AdapterHealthCheck:
        return AdapterHealthCheck(is_healthy=False, message="EDR: реальні credentials ще не налаштовані (симуляція)")

    async def search(self, query_text: str, filters: dict[str, Any] | None = None) -> AdapterSearchResult:
        results = [
            {
                "simulated": True,
                "source": "edr",
                "query": query_text,
                "company_name": f"Симульований результат для «{query_text}»",
                "note": "EDR-адаптер ще не підключено до реального реєстру",
                "collected_at": datetime.now(timezone.utc).isoformat(),
            }
        ]
        return AdapterSearchResult(results=results, raw_count=len(results))
