import { httpClient } from "./httpClient";

export async function listRaces({ page = 0, size = 10, sort = "scheduledAt,desc", type, status, search } = {}) {
  const { data } = await httpClient.get("/races", {
    params: {
      page,
      size,
      sort,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    },
  });
  return data; // Page<RaceResponse>
}

export async function getRace(id) {
  const { data } = await httpClient.get(`/races/${id}`);
  return data;
}

export async function createRace(payload) {
  const { data } = await httpClient.post("/races", payload);
  return data;
}

export async function updateRace(id, payload) {
  const { data } = await httpClient.put(`/races/${id}`, payload);
  return data;
}

export async function updateRaceStatus(id, status) {
  const { data } = await httpClient.patch(`/races/${id}/status`, { status });
  return data;
}

export async function deleteRace(id) {
  await httpClient.delete(`/races/${id}`);
}
