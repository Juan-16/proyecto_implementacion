import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { getRace } from "../../api/raceApi";
import { listCompetitors } from "../../api/competitorApi";
import { listTeams } from "../../api/teamApi";
import {
  listRegistrationsByRace,
  registerParticipant,
  approveRegistration,
  rejectRegistration,
  cancelRegistration,
} from "../../api/registrationApi";
import { parseApiError } from "../../api/httpClient";
import {
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_STYLES,
} from "../../constants/raceLabels";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export default function RaceRegistrationsPage() {
  const { raceId } = useParams();
  const { showToast } = useToast();

  const [race, setRace] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [participantType, setParticipantType] = useState("competitor");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [registering, setRegistering] = useState(false);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [raceData, regsPage, competitorsPage, teamsPage] = await Promise.all([
        getRace(raceId),
        listRegistrationsByRace(raceId, { size: 50 }),
        listCompetitors({ status: "ACTIVE", size: 100 }),
        listTeams({ size: 100 }),
      ]);
      setRace(raceData);
      setRegistrations(regsPage.content);
      setCompetitors(competitorsPage.content);
      setTeams(teamsPage.content.filter((t) => t.status === "ACTIVE"));
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Individual solo admite competidores, Team solo equipos, Mixed admite ambos.
  const allowCompetitor = race?.raceType !== "TEAM";
  const allowTeam = race?.raceType !== "INDIVIDUAL";

  async function handleRegister(event) {
    event.preventDefault();
    if (!selectedParticipant) return;
    setRegistering(true);
    try {
      const payload =
        participantType === "competitor"
          ? { competitorId: Number(selectedParticipant) }
          : { teamId: Number(selectedParticipant) };
      await registerParticipant(raceId, payload);
      showToast("Inscripción registrada correctamente.");
      setSelectedParticipant("");
      loadAll();
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setRegistering(false);
    }
  }

  async function handleApprove(id) {
    setActionLoadingId(id);
    try {
      await approveRegistration(id);
      showToast("Inscripción aprobada.");
      loadAll();
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(id) {
    if (!rejectReason.trim()) {
      showToast("Escribe una razón de rechazo.", "error");
      return;
    }
    setActionLoadingId(id);
    try {
      await rejectRegistration(id, rejectReason.trim());
      showToast("Inscripción rechazada.");
      setRejectingId(null);
      setRejectReason("");
      loadAll();
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(id) {
    setActionLoadingId(id);
    try {
      await cancelRegistration(id);
      showToast("Inscripción cancelada.");
      loadAll();
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) return <p className="font-body text-sm text-dune-700">Cargando…</p>;
  if (loadError) return <p className="font-body text-sm text-clay-600">{loadError}</p>;

  return (
    <div className="max-w-3xl">
      <Link to={`/carreras/${raceId}`} className="font-body text-sm text-dune-700 hover:underline">
        ← Volver a la carrera
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold text-dune-950">
        Inscripciones — {race?.name}
      </h1>

      <form onSubmit={handleRegister} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-dune-700/15 bg-white p-5">
        {allowCompetitor && allowTeam && (
          <Select
            id="participantType"
            label="Tipo"
            value={participantType}
            onChange={(e) => {
              setParticipantType(e.target.value);
              setSelectedParticipant("");
            }}
          >
            <option value="competitor">Competidor individual</option>
            <option value="team">Equipo</option>
          </Select>
        )}
        <div className="min-w-[220px] flex-1">
          <Select
            id="participant"
            label={participantType === "competitor" ? "Competidor" : "Equipo"}
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
          >
            <option value="">Selecciona…</option>
            {(participantType === "competitor" ? competitors : teams).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nickname ?? p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Button type="submit" loading={registering} disabled={!selectedParticipant}>
            Inscribir
          </Button>
        </div>
      </form>

      <div className="mt-6 divide-y divide-dune-700/10 rounded-lg border border-dune-700/15 bg-white">
        {registrations.length === 0 ? (
          <p className="px-5 py-6 font-body text-sm text-dune-700">Todavía no hay inscripciones.</p>
        ) : (
          registrations.map((reg) => (
            <div key={reg.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-dune-950">
                    {reg.competitorName ?? reg.teamName}
                  </p>
                  <p className="font-body text-xs text-dune-700">
                    Inscrito el {new Date(reg.registeredAt).toLocaleString("es-CO")}
                    {reg.startingPosition ? ` · posición ${reg.startingPosition}` : ""}
                  </p>
                </div>
                <Badge className={REGISTRATION_STATUS_STYLES[reg.status]}>
                  {REGISTRATION_STATUS_LABELS[reg.status]}
                </Badge>
              </div>

              {reg.status === "PENDING" && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleApprove(reg.id)}
                    disabled={actionLoadingId === reg.id}
                    className="font-body text-sm font-medium text-pine-600 hover:underline disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  {rejectingId === reg.id ? (
                    <>
                      <input
                        type="text"
                        placeholder="Razón de rechazo…"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="rounded-md border border-dune-700/20 px-3 py-1.5 font-body text-sm outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleReject(reg.id)}
                        disabled={actionLoadingId === reg.id}
                        className="font-body text-sm font-medium text-clay-600 hover:underline disabled:opacity-50"
                      >
                        Confirmar rechazo
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="font-body text-sm text-dune-700 hover:underline"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setRejectingId(reg.id)}
                      className="font-body text-sm font-medium text-clay-600 hover:underline"
                    >
                      Rechazar
                    </button>
                  )}
                </div>
              )}

              {reg.status === "APPROVED" && (
                <button
                  onClick={() => handleCancel(reg.id)}
                  disabled={actionLoadingId === reg.id}
                  className="mt-3 font-body text-sm font-medium text-clay-600 hover:underline disabled:opacity-50"
                >
                  Cancelar inscripción
                </button>
              )}

              {reg.status === "REJECTED" && reg.rejectionReason && (
                <p className="mt-2 font-body text-xs text-dune-700">Razón: {reg.rejectionReason}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
