import { useEffect, useState } from "react";
import { getCompetitorStandings, getTeamStandings } from "../../api/standingsApi";
import { parseApiError } from "../../api/httpClient";

export default function StandingsPage() {
  const [tab, setTab] = useState("competitors");
  const [competitorStandings, setCompetitorStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    Promise.all([getCompetitorStandings(), getTeamStandings()])
      .then(([competitors, teams]) => {
        setCompetitorStandings(competitors);
        setTeamStandings(teams);
      })
      .catch((error) => setLoadError(parseApiError(error).message))
      .finally(() => setLoading(false));
  }, []);

  const rows = tab === "competitors" ? competitorStandings : teamStandings;
  const sorted = [...rows].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-dune-950">Tabla de posiciones</h1>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("competitors")}
          className={`rounded-md px-4 py-2 font-body text-sm font-medium transition ${
            tab === "competitors" ? "bg-dune-950 text-sand-100" : "bg-white text-dune-800"
          }`}
        >
          Competidores
        </button>
        <button
          onClick={() => setTab("teams")}
          className={`rounded-md px-4 py-2 font-body text-sm font-medium transition ${
            tab === "teams" ? "bg-dune-950 text-sand-100" : "bg-white text-dune-800"
          }`}
        >
          Equipos
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-dune-700/15 bg-white">
        {loading ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">Cargando posiciones…</div>
        ) : loadError ? (
          <div className="p-10 text-center font-body text-sm text-clay-600">{loadError}</div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">
            Todavía no hay resultados que generen una tabla de posiciones.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dune-700/10 font-body text-xs uppercase tracking-wide text-dune-700/60">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Victorias</th>
                <th className="px-5 py-3">Derrotas</th>
                {tab === "competitors" && <th className="px-5 py-3">Carreras</th>}
                <th className="px-5 py-3">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={row.competitorId ?? row.teamId}
                  className="border-b border-dune-700/5 font-body text-sm text-dune-950 last:border-0"
                >
                  <td className="px-5 py-3 text-dune-700">{i + 1}</td>
                  <td className="px-5 py-3 font-medium">{row.nickname ?? row.name}</td>
                  <td className="px-5 py-3 text-dune-700">{row.victories}</td>
                  <td className="px-5 py-3 text-dune-700">{row.defeats}</td>
                  {tab === "competitors" && <td className="px-5 py-3 text-dune-700">{row.racesCompleted}</td>}
                  <td className="px-5 py-3 font-semibold text-amber-600">{row.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
