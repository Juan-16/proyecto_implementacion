import { httpClient } from "./httpClient";

// Coincide con CompetitorController: page/size/sort son de Spring Pageable,
// type/status/search son los filtros que CompetitorSpecifications soporta.
export async function listCompetitors({ page = 0, size = 10, sort = "nickname,asc", type, status, search } = {}) {
  const { data } = await httpClient.get("/competitors", {
    params: {
      page,
      size,
      sort,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    },
  });
  return data; // Page<CompetitorResponse>: content, totalElements, totalPages, number, size
}

export async function getCompetitor(id) {
  const { data } = await httpClient.get(`/competitors/${id}`);
  return data;
}

export async function createCompetitor(payload) {
  const { data } = await httpClient.post("/competitors", payload);
  return data;
}

export async function updateCompetitor(id, payload) {
  const { data } = await httpClient.put(`/competitors/${id}`, payload);
  return data;
}

export async function updateCompetitorStatus(id, status) {
  const { data } = await httpClient.patch(`/competitors/${id}/status`, { status });
  return data;
}

// El backend retira en vez de borrar si el competidor tiene carreras
// oficiales — esta llamada es la misma sin importar cuál de los dos pase.
export async function deleteCompetitor(id) {
  await httpClient.delete(`/competitors/${id}`);
}
