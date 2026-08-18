from typing import Any

from osint_hub.integrations.registries.base import AdapterHealthCheck, AdapterNotConfigured, AdapterSearchResult, RegistryAdapter


class AlmazAdapter(RegistryAdapter):
    """Registry adapter for ALMAZ hardware security key auth.

    STUB: real integration needs the ALMAZ hardware SDK / PyUSB access to a physical
    token (per doc section 'Security Tools' — F1.1). No hardware is available in this
    environment, so every call reports itself as unconfigured instead of pretending to work.
    """

    async def test_connection(self) -> AdapterHealthCheck:
        return AdapterHealthCheck(
            is_healthy=False,
            message="ALMAZ-адаптер ще не реалізовано: потрібен апаратний токен і SDK виробника",
        )

    async def search(self, query_text: str, filters: dict[str, Any] | None = None) -> AdapterSearchResult:
        raise AdapterNotConfigured("ALMAZ-адаптер ще не реалізовано: потрібен апаратний токен і SDK виробника")
