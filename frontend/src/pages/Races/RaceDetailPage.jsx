import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getRace, updateRaceStatus, deleteRace } from "../../api/raceApi";
import { parseApiError } from "../../api/httpClient";
import {
  RACE_TYPE_LABELS,
  RACE_STATUS_LABELS,
  RACE_STATUS_STYLES,
  RACE_STATUS_TRANSITIONS,
} from "../../constants/raceLabels";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

function Field({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs uppercase tracking-wide text-dune-700/60">{label}</p>
      <p className="mt-1 font-body text-base text-dune-950">{value ?? "—"}</p>
    </div>
  );
}

export default function RaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, hasAnyRole } = useAuth();
  const { showToast } = useToast();
  const canManage = hasAnyRole(["ADMINISTRATOR", "RACE_ORGANIZER"]);
  const canDelete = hasRole("ADMINISTRATOR");

  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRace(await getRace(id));
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(event) {
    const newStatus = event.target.value;
    setChangingStatus(true);
    try {
      const updated = await updateRaceStatus(id, newStatus);
      setRace(updated);
      showToast("Estado de la carrera actualizado.");
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteRace(id);
      showToast("Carrera eliminada correctamente.");
      navigate("/carreras");
    } catch (error) {
      showToast(parseApiError(error).message, "error");
      setDeleting(false);
    }
  }

  if (loading) return <p className="font-body text-sm text-dune-700">Cargando…</p>;
  if (loadError) return <p className="font-body text-sm text-clay-600">{loadError}</p>;
  if (!race) return null;

  const availableTransitions = RACE_STATUS_TRANSITIONS[race.status] ?? [];

  return (
    <div className="max-w-2xl">
      <Link to="/carreras" className="font-body text-sm text-dune-700 hover:underline">
        ← Volver al listado
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-dune-950">{race.name}</h1>
          <p className="mt-1 font-body text-sm text-dune-700">
            {race.scheduledAt ? new Date(race.scheduledAt).toLocaleString("es-CO") : "Sin fecha"}
          </p>
        </div>
        <Badge className={RACE_STATUS_STYLES[race.status]}>{RACE_STATUS_LABELS[race.status]}</Badge>
      </div>

      {race.description && <p className="mt-4 font-body text-sm text-dune-700">{race.description}</p>}

      <div className="mt-8 grid grid-cols-2 gap-6 rounded-lg border border-dune-700/15 bg-white p-6">
        <Field label="Tipo" value={RACE_TYPE_LABELS[race.raceType]} />
        <Field label="Organizador" value={race.organizer} />
        <Field label="Distancia" value={race.distanceMeters ? `${race.distanceMeters} m` : null} />
        <Field label="Máx. participantes" value={race.maxParticipants} />
        <Field label="Punto de partida" value={race.startLocation} />
        <Field label="Punto de llegada" value={race.finishLocation} />
        <Field
          label="Cierre de inscripciones"
          value={race.registrationDeadline ? new Date(race.registrationDeadline).toLocaleString("es-CO") : null}
        />
      </div>

      {canManage && availableTransitions.length > 0 && (
        <div className="mt-6 max-w-xs">
          <Select id="status" label="Cambiar estado" value="" onChange={handleStatusChange} disabled={changingStatus}>
            <option value="" disabled>
              {changingStatus ? "Actualizando…" : "Selecciona el siguiente estado…"}
            </option>
            {availableTransitions.map((s) => (
              <option key={s} value={s}>
                {RACE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-5">
        {canManage && (
          <Link to={`/carreras/${id}/editar`} className="font-body text-sm font-medium text-amber-600 hover:underline">
            Editar carrera
          </Link>
        )}
        {canManage && (
          <Link to={`/carreras/${id}/inscripciones`} className="font-body text-sm font-medium text-amber-600 hover:underline">
            Gestionar inscripciones
          </Link>
        )}
        <Link to={`/carreras/${id}/resultados`} className="font-body text-sm font-medium text-amber-600 hover:underline">
          Ver resultados
        </Link>
        {canDelete && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="font-body text-sm font-medium text-clay-600 hover:underline"
          >
            Eliminar carrera
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Eliminar carrera"
        description={`¿Seguro que quieres eliminar "${race.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
