import type { ApiRegistry } from "@/types/api";

// Three connector-level statuses from MODULE_ARCHITECTURE.md §5.
export type ConnectorStatus = "connected" | "auth_required" | "network_unavailable" | "unknown";

export const CONNECTOR_STATUS_LABEL: Record<ConnectorStatus, string> = {
  connected: "підключено",
  auth_required: "потрібна авторизація",
  network_unavailable: "мережа недоступна",
  unknown: "не перевірено",
};

export const CONNECTOR_STATUS_COLOR: Record<ConnectorStatus, string> = {
  connected: "#10B981",
  auth_required: "#F59E0B",
  network_unavailable: "#EF4444",
  unknown: "#94A3B8",
};

export function deriveConnectorStatus(registry: ApiRegistry): ConnectorStatus {
  if (registry.requires_almaz) return "auth_required";
  if (registry.requires_vpn) return "network_unavailable";
  if (registry.is_healthy === true) return "connected";
  if (registry.is_healthy === false) return "auth_required";
  return "unknown";
}
