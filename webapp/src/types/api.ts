export interface ApiUser {
  id: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  theme: string;
  preferred_language: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiRegistry {
  id: string;
  name: string;
  description: string | null;
  auth_type: string | null;
  base_url: string | null;
  api_endpoint: string | null;
  requires_vpn: boolean;
  requires_almaz: boolean;
  is_active: boolean;
  is_public: boolean;
  last_tested_at: string | null;
  is_healthy: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ApiQuery {
  id: string;
  query_text: string;
  query_type: string | null;
  registry_id: string | null;
  source_system: string | null;
  result_count: number | null;
  confidence_level: number | null;
  tags: Record<string, unknown> | null;
  created_at: string;
  executed_at: string | null;
  completed_at: string | null;
  execution_duration_ms: number | null;
  status: "running" | "completed";
}

export interface ApiQueryDetail extends ApiQuery {
  results: Record<string, unknown>[];
}

export interface ApiError {
  error: { code: string; message: string; details?: Record<string, unknown> };
}

// ── Entity-centric model (OSINT_HUB_MODULE_ARCHITECTURE.md) ─────────────────
export type EntityType = "person" | "legal_entity" | "vehicle" | "location" | "account" | "contact" | "asset";
export type Confidence = "confirmed" | "probable" | "unverified";

export interface ApiCase {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  case_type: string | null;
  status: string;
  classification: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiEntity {
  id: string;
  case_id: string | null;
  entity_type: EntityType;
  display_name: string;
  confidence: Confidence;
  created_at: string;
  updated_at: string;
  details: Record<string, unknown>;
  media_count: number;
}

export interface ApiRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  description: string | null;
  confidence: Confidence;
  created_at: string;
}

export interface ApiEvent {
  id: string;
  case_id: string;
  entity_id: string | null;
  event_date: string | null;
  title: string;
  description: string | null;
  confidence: Confidence;
  created_at: string;
}

// ── Capture Inbox ─────────────────────────────────────────────────────────
export type CaptureStatus = "pending" | "attached" | "discarded";

export interface ApiCaptureItem {
  id: string;
  file_name: string;
  media_type: string | null;
  file_size_bytes: number | null;
  notes: string | null;
  status: CaptureStatus;
  case_id: string | null;
  entity_id: string | null;
  uploaded_at: string;
  attached_at: string | null;
}
