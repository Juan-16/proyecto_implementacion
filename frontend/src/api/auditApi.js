import { httpClient } from "./httpClient";

export async function listAuditLogs({ page = 0, size = 20, sort = "occurredAt,desc" } = {}) {
  const { data } = await httpClient.get("/audit-logs", { params: { page, size, sort } });
  return data; // Page<AuditLogResponse>
}
