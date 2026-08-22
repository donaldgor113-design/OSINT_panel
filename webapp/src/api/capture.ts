import { apiClient } from "./client";
import type { ApiCaptureItem, CaptureStatus } from "@/types/api";

export async function uploadCapture(file: File): Promise<ApiCaptureItem> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<ApiCaptureItem>("/capture/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listCaptureItems(statusFilter?: CaptureStatus): Promise<ApiCaptureItem[]> {
  const { data } = await apiClient.get<ApiCaptureItem[]>("/capture", { params: { status_filter: statusFilter } });
  return data;
}

export async function attachCaptureItem(id: string, caseId: string, entityId: string): Promise<ApiCaptureItem> {
  const { data } = await apiClient.post<ApiCaptureItem>(`/capture/${id}/attach`, { case_id: caseId, entity_id: entityId });
  return data;
}

export async function discardCaptureItem(id: string): Promise<void> {
  await apiClient.delete(`/capture/${id}`);
}

export async function fetchCaptureFileBlob(id: string): Promise<Blob> {
  const { data } = await apiClient.get(`/capture/${id}/file`, { responseType: "blob" });
  return data;
}
