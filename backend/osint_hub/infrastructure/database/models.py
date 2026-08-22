import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, LargeBinary, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from osint_hub.infrastructure.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    password_salt: Mapped[str] = mapped_column(String(255), nullable=False)

    biometric_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    biometric_data: Mapped[bytes | None] = mapped_column(LargeBinary)

    encryption_key_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    theme: Mapped[str] = mapped_column(String(20), default="dark")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    sessions: Mapped[list["Session"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_activity_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="sessions")

    __table_args__ = (
        Index("idx_sessions_user_id", "user_id"),
        Index("idx_sessions_expires_at", "expires_at"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(50))
    resource_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    action: Mapped[str | None] = mapped_column(String(50))
    details: Mapped[dict | None] = mapped_column(JSONB)

    ip_address: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    session_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    status: Mapped[str] = mapped_column(String(50), default="success")
    error_message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_audit_logs_user_id", "user_id"),
        Index("idx_audit_logs_event_type", "event_type"),
        Index("idx_audit_logs_resource_type", "resource_type"),
        Index("idx_audit_logs_created_at", "created_at"),
    )


class Registry(Base):
    __tablename__ = "registries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    auth_type: Mapped[str | None] = mapped_column(String(50))
    auth_data_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary)

    base_url: Mapped[str | None] = mapped_column(String(500))
    api_endpoint: Mapped[str | None] = mapped_column(String(500))
    requires_vpn: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_almaz: Mapped[bool] = mapped_column(Boolean, default=False)
    almaz_key_id: Mapped[str | None] = mapped_column(String(255))

    rate_limit_requests: Mapped[int | None] = mapped_column(Integer)
    rate_limit_period_seconds: Mapped[int | None] = mapped_column(Integer)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    last_tested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_healthy: Mapped[bool | None] = mapped_column(Boolean)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_registries_is_active", "is_active"),
        Index("idx_registries_auth_type", "auth_type"),
    )


class Query(Base):
    __tablename__ = "queries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    query_type: Mapped[str | None] = mapped_column(String(50))

    registry_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("registries.id"))
    source_system: Mapped[str | None] = mapped_column(String(100))

    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    execution_duration_ms: Mapped[int | None] = mapped_column(Integer)

    result_count: Mapped[int | None] = mapped_column(Integer)
    result_data_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary)

    tags: Mapped[dict | None] = mapped_column(JSONB)
    confidence_level: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_queries_user_id", "user_id"),
        Index("idx_queries_source_system", "source_system"),
        Index("idx_queries_created_at", "created_at"),
    )


# ── Entity-centric model (OSINT_HUB_MODULE_ARCHITECTURE.md) ─────────────────
# A Case is the investigation container; Entities (Person/LegalEntity/Vehicle/
# Location/Account/Contact/Asset) attach to it. Each concrete type has its own
# details table (1:1 with entities.id) instead of one sparse generic table.
# Relationships connect any two entities; FieldProvenance tracks per-field
# source/confidence so reports can cite where each fact came from.

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    goal: Mapped[str | None] = mapped_column(Text)
    case_type: Mapped[str | None] = mapped_column(String(50))  # person|legal_entity|surveillance|recognition|monitoring|mixed

    status: Mapped[str] = mapped_column(String(50), default="active")  # active|paused|closed|archived
    classification: Mapped[str | None] = mapped_column(String(50))

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    entities: Mapped[list["Entity"]] = relationship(back_populates="case")
    events: Mapped[list["Event"]] = relationship(back_populates="case")

    __table_args__ = (
        Index("idx_cases_user_id", "user_id"),
        Index("idx_cases_status", "status"),
    )


class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"))

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # person|legal_entity|vehicle|location|account|contact|asset
    display_name: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence: Mapped[str] = mapped_column(String(20), default="unverified")  # confirmed|probable|unverified

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    case: Mapped["Case | None"] = relationship(back_populates="entities")

    __table_args__ = (
        Index("idx_entities_case_id", "case_id"),
        Index("idx_entities_entity_type", "entity_type"),
    )


class PersonDetails(Base):
    __tablename__ = "person_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    first_name: Mapped[str | None] = mapped_column(String(255))
    last_name: Mapped[str | None] = mapped_column(String(255))
    patronymic: Mapped[str | None] = mapped_column(String(255))
    date_of_birth: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    passport_number: Mapped[str | None] = mapped_column(String(100))
    tax_id: Mapped[str | None] = mapped_column(String(100))
    photo_url: Mapped[str | None] = mapped_column(String(1000))
    notes: Mapped[str | None] = mapped_column(Text)


class LegalEntityDetails(Base):
    __tablename__ = "legal_entity_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    legal_name: Mapped[str | None] = mapped_column(String(500))
    registration_number: Mapped[str | None] = mapped_column(String(100))
    director_name: Mapped[str | None] = mapped_column(String(255))
    registered_address: Mapped[str | None] = mapped_column(Text)
    statutory_capital: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)


class VehicleDetails(Base):
    __tablename__ = "vehicle_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    plate_number: Mapped[str | None] = mapped_column(String(50))
    make: Mapped[str | None] = mapped_column(String(100))
    model: Mapped[str | None] = mapped_column(String(100))
    year: Mapped[int | None] = mapped_column(Integer)
    vin: Mapped[str | None] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(50))
    notes: Mapped[str | None] = mapped_column(Text)


class LocationDetails(Base):
    __tablename__ = "location_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    address: Mapped[str | None] = mapped_column(Text)
    latitude: Mapped[float | None] = mapped_column()
    longitude: Mapped[float | None] = mapped_column()
    location_type: Mapped[str | None] = mapped_column(String(50))  # residence|workplace|sighting|other
    notes: Mapped[str | None] = mapped_column(Text)


class AccountDetails(Base):
    __tablename__ = "account_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    platform: Mapped[str | None] = mapped_column(String(100))  # telegram|instagram|facebook|...
    handle: Mapped[str | None] = mapped_column(String(255))
    url: Mapped[str | None] = mapped_column(String(1000))
    followers_count: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)


class ContactDetails(Base):
    __tablename__ = "contact_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    contact_type: Mapped[str | None] = mapped_column(String(20))  # phone|email
    value: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)


class AssetDetails(Base):
    __tablename__ = "asset_details"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    asset_type: Mapped[str | None] = mapped_column(String(50))  # real_estate|vehicle|bank_account|other
    description: Mapped[str | None] = mapped_column(Text)
    estimated_value: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="SET NULL"))

    event_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[str] = mapped_column(String(20), default="unverified")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    case: Mapped["Case"] = relationship(back_populates="events")

    __table_args__ = (
        Index("idx_events_case_id", "case_id"),
        Index("idx_events_entity_id", "entity_id"),
        Index("idx_events_event_date", "event_date"),
    )


class Relationship(Base):
    __tablename__ = "relationships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    target_entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)

    relationship_type: Mapped[str] = mapped_column(String(100), nullable=False)  # родич|співвласник|керівник|пов'язаний_акаунт|...
    description: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[str] = mapped_column(String(20), default="unverified")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_relationships_source_entity_id", "source_entity_id"),
        Index("idx_relationships_target_entity_id", "target_entity_id"),
    )


class FieldProvenance(Base):
    """Per-field source metadata: which module/source produced a given field value, when, and how confident."""

    __tablename__ = "field_provenance"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)

    source_module: Mapped[str | None] = mapped_column(String(100))  # registries|capture_inbox|manual|monitoring|recognition
    source_name: Mapped[str | None] = mapped_column(String(255))
    query_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("queries.id"))

    retrieved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    retrieved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    confidence: Mapped[str] = mapped_column(String(20), default="unverified")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_field_provenance_entity_id", "entity_id"),
        Index("idx_field_provenance_entity_field", "entity_id", "field_name"),
    )


class EntityMedia(Base):
    __tablename__ = "entity_media"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)

    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    media_type: Mapped[str | None] = mapped_column(String(50))  # image|video|document|other

    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    __table_args__ = (
        Index("idx_entity_media_entity_id", "entity_id"),
    )


class CaptureItem(Base):
    """Capture Inbox staging area: files land here untagged, then get manually attached
    to a case/entity (Phase 1 — manual tagging only, no OCR/Vision AI yet)."""

    __tablename__ = "capture_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    media_type: Mapped[str | None] = mapped_column(String(50))  # image|video|document|other
    file_size_bytes: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)

    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|attached|discarded
    case_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"))
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id", ondelete="SET NULL"))

    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    attached_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        Index("idx_capture_items_uploaded_by", "uploaded_by"),
        Index("idx_capture_items_status", "status"),
    )
