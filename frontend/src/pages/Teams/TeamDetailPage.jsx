import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getTeam, addTeamMember, removeTeamMember } from "../../api/teamApi";
import { listCompetitors } from "../../api/competitorApi";
import { parseApiError } from "../../api/httpClient";
import { TEAM_STATUS_LABELS, TEAM_STATUS_STYLES } from "../../constants/raceLabels";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canManage = hasRole("ADMINISTRATOR");

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [availableCompetitors, setAvailableCompetitors] = useState([]);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTeam(await getTeam(id));
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // Solo se cargan competidores activos para el selector, y solo si se
  // pueden gestionar miembros (evita una llamada innecesaria para viewers).
  useEffect(() => {
    if (!canManage) return;
    listCompetitors({ status: "ACTIVE", size: 100 })
      .then((page) => setAvailableCompetitors(page.content))
      .catch(() => {});
  }, [canManage]);

  const memberIds = new Set(team?.members?.map((m) => m.competitorId));
  const selectableCompetitors = availableCompetitors.filter((c) => !memberIds.has(c.id));

  async function handleAddMember(event) {
    event.preventDefault();
    if (!selectedCompetitorId) return;
    setAddingMember(true);
    try {
      const updated = await addTeamMember(id, selectedCompetitorId);
      setTeam(updated);
      setSelectedCompetitorId("");
      showToast("Competidor agregado al equipo.");
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(competitorId) {
    setRemovingId(competitorId);
    try {
      const updated = await removeTeamMember(id, competitorId);
      setTeam(updated);
      showToast("Competidor removido del equipo.");
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) return <p className="font-body text-sm text-dune-700">Cargando…</p>;
  if (loadError) return <p className="font-body text-sm text-clay-600">{loadError}</p>;
  if (!team) return null;

  return (
    <div className="max-w-2xl">
      <Link to="/equipos" className="font-body text-sm text-dune-700 hover:underline">
        ← Volver al listado
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-dune-950">{team.name}</h1>
          <p className="mt-1 font-body text-sm text-dune-700">
            {team.coachName ? `Entrenador: ${team.coachName}` : "Sin entrenador asignado"}
          </p>
        </div>
        <Badge className={TEAM_STATUS_STYLES[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
      </div>

      {team.description && (
        <p className="mt-4 font-body text-sm text-dune-700">{team.description}</p>
      )}

      <div className="mt-4 flex gap-6 font-body text-sm text-dune-700">
        <span>{team.victories} victorias</span>
        <span>{team.defeats} derrotas</span>
      </div>

      {canManage && (
        <button
          onClick={() => navigate(`/equipos/${id}/editar`)}
          className="mt-4 font-body text-sm font-medium text-amber-600 hover:underline"
        >
          Editar datos del equipo
        </button>
      )}

      <h2 className="mt-8 font-display text-xl font-semibold text-dune-950">
        Miembros ({team.members?.length ?? 0})
      </h2>

      <div className="mt-3 divide-y divide-dune-700/10 rounded-lg border border-dune-700/15 bg-white">
        {team.members?.length ? (
          team.members.map((m) => (
            <div key={m.competitorId} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-body text-sm font-medium text-dune-950">{m.competitorNickname}</p>
                <p className="font-body text-xs text-dune-700">{m.competitorName}</p>
              </div>
              {canManage && (
                <button
                  onClick={() => handleRemoveMember(m.competitorId)}
                  disabled={removingId === m.competitorId}
                  className="font-body text-sm font-medium text-clay-600 hover:underline disabled:opacity-50"
                >
                  {removingId === m.competitorId ? "Quitando…" : "Quitar"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="px-5 py-6 font-body text-sm text-dune-700">
            Este equipo todavía no tiene miembros.
          </p>
        )}
      </div>

      {canManage && (
        <form onSubmit={handleAddMember} className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <Select
              id="newMember"
              label="Agregar competidor activo"
              value={selectedCompetitorId}
              onChange={(e) => setSelectedCompetitorId(e.target.value)}
            >
              <option value="">Selecciona un competidor…</option>
              {selectableCompetitors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nickname} ({c.name})
                </option>
              ))}
            </Select>
          </div>
          <div className="w-36">
            <Button type="submit" loading={addingMember} disabled={!selectedCompetitorId}>
              Agregar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
