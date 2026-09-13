import { httpClient } from "./httpClient";

export async function listResultsByRace(raceId) {
  const { data } = await httpClient.get(`/races/${raceId}/results`);
  return data; // List<RaceResultResponse>, sin paginar
}

export async function getResult(id) {
  const { data } = await httpClient.get(`/results/${id}`);
  return data;
}

export async function createResult(raceId, payload) {
  const { data } = await httpClient.post(`/races/${raceId}/results`, payload);
  return data;
}

export async function updateResult(id, payload) {
  const { data } = await httpClient.put(`/results/${id}`, payload);
  return data;
}
