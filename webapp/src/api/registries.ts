import { apiClient } from "./client";
import type { ApiRegistry } from "@/types/api";

export async function listRegistries(): Promise<ApiRegistry[]> {
  const { data } = await apiClient.get<ApiRegistry[]>("/registries");
  return data;
}

export async function testRegistry(id: string): Promise<{ is_healthy: boolean; message: string }> {
  const { data } = await apiClient.post(`/registries/${id}/test`);
  return data;
}

export async function queryRegistry(
  id: string,
  queryText: string,
  filters?: Record<string, unknown>
): Promise<{ query_id: string; result_count: number; results: Record<string, unknown>[] }> {
  const { data } = await apiClient.post(`/registries/${id}/query`, { query_text: queryText, filters });
  return data;
}
