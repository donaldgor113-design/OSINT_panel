import { apiClient } from "./client";
import type { ApiCase, ApiEntity, ApiEvent, ApiRelationship } from "@/types/api";

export async function listCases(): Promise<ApiCase[]> {
  const { data } = await apiClient.get<ApiCase[]>("/cases");
  return data;
}

export async function createCase(payload: {
  title: string;
  description?: string;
  goal?: string;
  case_type?: string;
}): Promise<ApiCase> {
  const { data } = await apiClient.post<ApiCase>("/cases", payload);
  return data;
}

export async function getCase(id: string): Promise<ApiCase> {
  const { data } = await apiClient.get<ApiCase>(`/cases/${id}`);
  return data;
}

export async function updateCase(id: string, payload: Partial<Pick<ApiCase, "title" | "description" | "goal" | "status" | "classification">>): Promise<ApiCase> {
  const { data } = await apiClient.patch<ApiCase>(`/cases/${id}`, payload);
  return data;
}

export async function listCaseEntities(caseId: string): Promise<ApiEntity[]> {
  const { data } = await apiClient.get<ApiEntity[]>(`/cases/${caseId}/entities`);
  return data;
}

export async function createEntity(
  caseId: string,
  payload: { entity_type: string; display_name: string; confidence?: string; details?: Record<string, unknown> }
): Promise<ApiEntity> {
  const { data } = await apiClient.post<ApiEntity>(`/cases/${caseId}/entities`, payload);
  return data;
}

export async function listCaseRelationships(caseId: string): Promise<ApiRelationship[]> {
  const { data } = await apiClient.get<ApiRelationship[]>(`/cases/${caseId}/relationships`);
  return data;
}

export async function createRelationship(payload: {
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  description?: string;
  confidence?: string;
}): Promise<ApiRelationship> {
  const { data } = await apiClient.post<ApiRelationship>("/relationships", payload);
  return data;
}

export async function listCaseEvents(caseId: string): Promise<ApiEvent[]> {
  const { data } = await apiClient.get<ApiEvent[]>(`/cases/${caseId}/events`);
  return data;
}

export async function createEvent(
  caseId: string,
  payload: { title: string; description?: string; event_date?: string; entity_id?: string }
): Promise<ApiEvent> {
  const { data } = await apiClient.post<ApiEvent>(`/cases/${caseId}/events`, payload);
  return data;
}
