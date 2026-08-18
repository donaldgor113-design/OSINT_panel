import { apiClient } from "./client";
import type { ApiQuery, ApiQueryDetail } from "@/types/api";

export async function createQuery(payload: {
  query_text: string;
  registry_id: string;
  query_type?: string;
  filters?: Record<string, unknown>;
}): Promise<ApiQueryDetail> {
  const { data } = await apiClient.post<ApiQueryDetail>("/queries", payload);
  return data;
}

export async function listQueries(params?: { limit?: number; offset?: number }): Promise<{ items: ApiQuery[]; total_count: number }> {
  const { data } = await apiClient.get("/queries", { params });
  return data;
}

export async function getQuery(id: string): Promise<ApiQueryDetail> {
  const { data } = await apiClient.get<ApiQueryDetail>(`/queries/${id}`);
  return data;
}

export async function deleteQuery(id: string): Promise<void> {
  await apiClient.delete(`/queries/${id}`);
}
