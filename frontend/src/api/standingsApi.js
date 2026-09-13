import { httpClient } from "./httpClient";

export async function getCompetitorStandings() {
  const { data } = await httpClient.get("/standings/competitors");
  return data; // List<CompetitorStandingResponse>
}

export async function getTeamStandings() {
  const { data } = await httpClient.get("/standings/teams");
  return data; // List<TeamStandingResponse>
}
