from typing import Any

import httpx

from osint_hub.integrations.registries.base import AdapterHealthCheck, AdapterNotConfigured, AdapterSearchResult, RegistryAdapter


class ApiAdapter(RegistryAdapter):
    """Generic REST API registry adapter. Makes real HTTP calls against registry.api_endpoint.

    Used for any registry that doesn't have a dedicated implementation — configure
    base_url/api_endpoint and an api_key (in credentials) via the registries API.
    """

    def _require_endpoint(self) -> str:
        endpoint = self.registry.api_endpoint or self.registry.base_url
        if not endpoint:
            raise AdapterNotConfigured(f"Реєстр '{self.registry.name}' не має налаштованого api_endpoint/base_url")
        return endpoint

    def _headers(self) -> dict[str, str]:
        api_key = self.credentials.get("api_key")
        return {"Authorization": f"Bearer {api_key}"} if api_key else {}

    async def test_connection(self) -> AdapterHealthCheck:
        try:
            endpoint = self._require_endpoint()
        except AdapterNotConfigured as exc:
            return AdapterHealthCheck(is_healthy=False, message=str(exc))

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(endpoint, headers=self._headers())
            return AdapterHealthCheck(is_healthy=response.status_code < 500, message=f"HTTP {response.status_code}")
        except httpx.HTTPError as exc:
            return AdapterHealthCheck(is_healthy=False, message=str(exc))

    async def search(self, query_text: str, filters: dict[str, Any] | None = None) -> AdapterSearchResult:
        endpoint = self._require_endpoint()
        params = {"q": query_text, **(filters or {})}

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(endpoint, params=params, headers=self._headers())
        response.raise_for_status()

        payload = response.json()
        results = payload if isinstance(payload, list) else payload.get("results", [])
        return AdapterSearchResult(results=results, raw_count=len(results))
