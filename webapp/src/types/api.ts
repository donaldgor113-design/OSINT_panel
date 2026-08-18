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
