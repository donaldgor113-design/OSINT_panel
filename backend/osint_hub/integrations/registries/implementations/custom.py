from typing import Any

from osint_hub.integrations.registries.api_adapter import ApiAdapter
from osint_hub.integrations.registries.base import AdapterSearchResult

# Template for adding a new registry integration:
#
# 1. Copy this file to implementations/<registry_name>.py
# 2. Rename CustomRegistryAdapter and override search()/test_connection() as needed
# 3. Register it in integrations/registries/__init__.py's _ADAPTERS_BY_NAME,
#    keyed by the lowercase registries.name value used in the database
#
# Extend ApiAdapter when the source is a REST API (inherits real HTTP test_connection/search).
# Extend RegistryAdapter directly when the source needs browser automation or custom logic.


class CustomRegistryAdapter(ApiAdapter):
    async def search(self, query_text: str, filters: dict[str, Any] | None = None) -> AdapterSearchResult:
        return await super().search(query_text, filters)
