from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from osint_hub.infrastructure.database.models import Registry


@dataclass
class AdapterHealthCheck:
    is_healthy: bool
    message: str


@dataclass
class AdapterSearchResult:
    results: list[dict[str, Any]] = field(default_factory=list)
    raw_count: int = 0


class AdapterNotConfigured(Exception):
    """Raised when a registry adapter is missing required config/credentials to run for real."""


class RegistryAdapter(ABC):
    """Common interface every registry integration (real or simulated) must implement."""

    def __init__(self, registry: "Registry", credentials: dict[str, Any]):
        self.registry = registry
        self.credentials = credentials

    @abstractmethod
    async def test_connection(self) -> AdapterHealthCheck: ...

    @abstractmethod
    async def search(self, query_text: str, filters: dict[str, Any] | None = None) -> AdapterSearchResult: ...
