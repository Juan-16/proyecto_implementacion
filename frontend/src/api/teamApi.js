import { httpClient } from "./httpClient";

export async function listTeams({ page = 0, size = 10, sort = "name,asc" } = {}) {
  const { data } = await httpClient.get("/teams", { params: { page, size, sort } });
  return data; // Page<TeamResponse>
}

export async function getTeam(id) {
  const { data } = await httpClient.get(`/teams/${id}`);
  return data;
}

export async function createTeam(payload) {
  const { data } = await httpClient.post("/teams", payload);
  return data;
}

export async function updateTeam(id, payload) {
  const { data } = await httpClient.put(`/teams/${id}`, payload);
  return data;
}

export async function deleteTeam(id) {
  await httpClient.delete(`/teams/${id}`);
}

export async function addTeamMember(teamId, competitorId) {
  const { data } = await httpClient.post(`/teams/${teamId}/members/${competitorId}`);
  return data;
}

export async function removeTeamMember(teamId, competitorId) {
  const { data } = await httpClient.delete(`/teams/${teamId}/members/${competitorId}`);
  return data;
}
