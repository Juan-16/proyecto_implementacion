import { httpClient } from "./httpClient";

export async function listRegistrationsByRace(raceId, { page = 0, size = 20 } = {}) {
  const { data } = await httpClient.get(`/races/${raceId}/registrations`, { params: { page, size } });
  return data; // Page<RaceRegistrationResponse>
}

export async function getRegistration(id) {
  const { data } = await httpClient.get(`/registrations/${id}`);
  return data;
}

// payload: { competitorId } o { teamId } (exactamente uno), + validationNotes opcional.
export async function registerParticipant(raceId, payload) {
  const { data } = await httpClient.post(`/races/${raceId}/registrations`, payload);
  return data;
}

export async function approveRegistration(id, startingPosition) {
  const { data } = await httpClient.patch(`/registrations/${id}/approve`, {
    ...(startingPosition ? { startingPosition: Number(startingPosition) } : {}),
  });
  return data;
}

export async function rejectRegistration(id, reason) {
  const { data } = await httpClient.patch(`/registrations/${id}/reject`, { reason });
  return data;
}

export async function cancelRegistration(id) {
  await httpClient.delete(`/registrations/${id}`);
}
