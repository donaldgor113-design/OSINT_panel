from osint_hub.infrastructure.database.models import Registry
from osint_hub.integrations.registries.almaz_adapter import AlmazAdapter
from osint_hub.integrations.registries.api_adapter import ApiAdapter
from osint_hub.integrations.registries.base import RegistryAdapter
from osint_hub.integrations.registries.implementations.dmu import DmuAdapter
from osint_hub.integrations.registries.implementations.edr import EdrAdapter

_ADAPTERS_BY_NAME: dict[str, type[RegistryAdapter]] = {
    "dmu": DmuAdapter,
    "edr": EdrAdapter,
}


def get_adapter(registry: Registry, credentials: dict) -> RegistryAdapter:
    if registry.requires_almaz:
        return AlmazAdapter(registry, credentials)

    adapter_cls = _ADAPTERS_BY_NAME.get(registry.name.strip().lower(), ApiAdapter)
    return adapter_cls(registry, credentials)
