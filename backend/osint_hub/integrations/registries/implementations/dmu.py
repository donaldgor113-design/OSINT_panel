from datetime import datetime, timezone
from typing import Any

from osint_hub.integrations.registries.base import AdapterHealthCheck, AdapterSearchResult, RegistryAdapter


class DmuAdapter(RegistryAdapter):
    """DMU (Department of Migration Service) registry adapter.

    STUB: no real DMU credentials/endpoint are configured. `search()` returns
    clearly-labeled simulated demo records so the collection pipeline (query ->
    normalize -> store) can be exercised end-to-end. Replace with a real
    selenium/API integration once credentials are available.
    """

    async def test_connection(self) -> AdapterHealthCheck:
        return AdapterHealthCheck(is_healthy=False, message="DMU: реальні credentials ще не налаштовані (симуляція)")

    async def search(self, query_text: str, filters: dict[str, Any] | None = None) -> AdapterSearchResult:
        results = [
            {
                "simulated": True,
                "source": "dmu",
                "query": query_text,
                "full_name": f"Симульований результат для «{query_text}»",
                "note": "DMU-адаптер ще не підключено до реального реєстру",
                "collected_at": datetime.now(timezone.utc).isoformat(),
            }
        ]
        return AdapterSearchResult(results=results, raw_count=len(results))
