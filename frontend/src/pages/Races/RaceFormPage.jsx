import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRace, createRace, updateRace } from "../../api/raceApi";
import { parseApiError } from "../../api/httpClient";
import { useToast } from "../../context/ToastContext";
import { RACE_TYPE_LABELS } from "../../constants/raceLabels";
import { toInputDateTime, toApiDateTime } from "../../utils/datetime";
import TextField from "../../components/ui/TextField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const emptyForm = {
  name: "",
  description: "",
  scheduledAt: "",
  startLocation: "",
  finishLocation: "",
  distanceMeters: "",
  maxParticipants: "",
  raceType: "",
  organizer: "",
  registrationDeadline: "",
};

export default function RaceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [lockedByStatus, setLockedByStatus] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getRace(id)
      .then((r) => {
        setForm({
          name: r.name,
          description: r.description ?? "",
          scheduledAt: toInputDateTime(r.scheduledAt),
          startLocation: r.startLocation ?? "",
          finishLocation: r.finishLocation ?? "",
          distanceMeters: r.distanceMeters ?? "",
          maxParticipants: r.maxParticipants ?? "",
          raceType: r.raceType,
          organizer: r.organizer ?? "",
          registrationDeadline: toInputDateTime(r.registrationDeadline),
        });
        // El backend rechaza editar carreras COMPLETED; lo anticipamos en la UI.
        setLockedByStatus(r.status === "COMPLETED");
      })
      .catch((error) => setFormError(parseApiError(error).message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function updateField(key) {
    return (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        scheduledAt: toApiDateTime(form.scheduledAt),
        startLocation: form.startLocation.trim() || null,
        finishLocation: form.finishLocation.trim() || null,
        distanceMeters: form.distanceMeters ? Number(form.distanceMeters) : null,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        raceType: form.raceType,
        organizer: form.organizer.trim() || null,
        registrationDeadline: toApiDateTime(form.registrationDeadline),
      };
      if (isEdit) {
        await updateRace(id, payload);
        showToast("Carrera actualizada correctamente.");
      } else {
        await createRace(payload);
        showToast("Carrera creada correctamente.");
      }
      navigate("/carreras");
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) setFieldErrors(parsed.fieldErrors);
      else setFormError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="font-body text-sm text-dune-700">Cargando…</p>;

  if (lockedByStatus) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-3xl font-semibold text-dune-950">Carrera completada</h1>
        <p className="mt-3 font-body text-sm text-dune-700">
          Esta carrera ya está en estado COMPLETADA y el backend no permite editarla.
        </p>
        <button
          onClick={() => navigate(`/carreras/${id}`)}
          className="mt-4 font-body text-sm font-medium text-amber-600 hover:underline"
        >
          Volver al detalle
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        {isEdit ? "Editar carrera" : "Nueva carrera"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <TextField id="name" label="Nombre" value={form.name} onChange={updateField("name")} error={fieldErrors.name} />
        <TextField id="description" label="Descripción" value={form.description} onChange={updateField("description")} error={fieldErrors.description} />

        <Select id="raceType" label="Tipo de carrera" value={form.raceType} onChange={updateField("raceType")} required>
          <option value="" disabled>Selecciona un tipo…</option>
          {Object.entries(RACE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="scheduledAt"
            label="Fecha y hora de la carrera"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={updateField("scheduledAt")}
            error={fieldErrors.scheduledAt}
          />
          <TextField
            id="registrationDeadline"
            label="Cierre de inscripciones"
            type="datetime-local"
            value={form.registrationDeadline}
            onChange={updateField("registrationDeadline")}
            error={fieldErrors.registrationDeadline}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="distanceMeters"
            label="Distancia (metros)"
            type="number"
            step="1"
            value={form.distanceMeters}
            onChange={updateField("distanceMeters")}
            error={fieldErrors.distanceMeters}
          />
          <TextField
            id="maxParticipants"
            label="Máx. participantes"
            type="number"
            value={form.maxParticipants}
            onChange={updateField("maxParticipants")}
            error={fieldErrors.maxParticipants}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField id="startLocation" label="Punto de partida" value={form.startLocation} onChange={updateField("startLocation")} error={fieldErrors.startLocation} />
          <TextField id="finishLocation" label="Punto de llegada" value={form.finishLocation} onChange={updateField("finishLocation")} error={fieldErrors.finishLocation} />
        </div>

        <TextField id="organizer" label="Organizador" value={form.organizer} onChange={updateField("organizer")} error={fieldErrors.organizer} />

        {formError && (
          <div role="alert" className="rounded-md border border-clay-500/30 bg-clay-500/10 px-3.5 py-2.5 font-body text-sm text-clay-600">
            {formError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/carreras")}
            className="flex-1 rounded-md border border-dune-700/20 px-4 py-2.5 font-body text-sm font-semibold text-dune-800 transition hover:bg-dune-700/5"
          >
            Cancelar
          </button>
          <div className="flex-1">
            <Button type="submit" loading={submitting}>
              {isEdit ? "Guardar cambios" : "Crear carrera"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
