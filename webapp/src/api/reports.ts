import { apiClient } from "./client";
import type { ApiReportTemplate, ApiReport, ApiReportDetail } from "@/types/api";

export async function listReportTemplates(): Promise<ApiReportTemplate[]> {
  const { data } = await apiClient.get<ApiReportTemplate[]>("/report-templates");
  return data;
}

export async function createReport(
  caseId: string,
  payload: { template_id: string; primary_entity_id?: string; title?: string }
): Promise<ApiReportDetail> {
  const { data } = await apiClient.post<ApiReportDetail>(`/cases/${caseId}/reports`, payload);
  return data;
}

export async function listReports(): Promise<ApiReport[]> {
  const { data } = await apiClient.get<ApiReport[]>("/reports");
  return data;
}

export async function listCaseReports(caseId: string): Promise<ApiReport[]> {
  const { data } = await apiClient.get<ApiReport[]>(`/cases/${caseId}/reports`);
  return data;
}

export async function getReport(id: string): Promise<ApiReportDetail> {
  const { data } = await apiClient.get<ApiReportDetail>(`/reports/${id}`);
  return data;
}

export async function updateReport(id: string, payload: { title?: string; status?: string }): Promise<ApiReportDetail> {
  const { data } = await apiClient.patch<ApiReportDetail>(`/reports/${id}`, payload);
  return data;
}

export async function deleteReport(id: string): Promise<void> {
  await apiClient.delete(`/reports/${id}`);
}

export async function downloadReportDocx(id: string, filename: string): Promise<void> {
  const { data } = await apiClient.get(`/reports/${id}/export`, {
    params: { export_format: "docx" },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
