import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getRace } from "../../api/raceApi";
import { listRegistrationsByRace } from "../../api/registrationApi";
import { listResultsByRace, createResult } from "../../api/resultApi";
import { parseApiError } from "../../api/httpClient";
import { RESULT_STATUS_LABELS } from "../../constants/raceLabels";
import TextField from "../../components/ui/TextField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const emptyForm = {
  registrationId: "",
  finalPosition: "",
  completionTimeSeconds: "",
  penaltyTimeSeconds: "0",
  status: "FINISHED",
  notes: "",
};

export default function RaceResultsPage() {
  const { raceId } = useParams();
  const { hasAnyRole } = useAuth();
  const { showToast } = useToast();
  const canManage = hasAnyRole(["ADMINISTRATOR", "RACE_ORGANIZER"]);

  const [race, setRace] = useState(null);
  const [results, setResults] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raceData = await getRace(raceId);
      const resultsList = await listResultsByRace(raceId);
      setRace(raceData);
      setResults(resultsList);

      if (canManage) {
        const regsPage = await listRegistrationsByRace(raceId, { size: 100 });
        const resultedIds = new Set(resultsList.map((r) => r.registrationId));
        setPendingRegistrations(
          regsPage.content.filter((r) => r.status === "APPROVED" && !resultedIds.has(r.id))
        );
      }
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [raceId, canManage]);

  useEffect(() => {
    load();
  }, [load]);

  function updateField(key) {
    return (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await createResult(raceId, {
        registrationId: Number(form.registrationId),
        finalPosition: form.finalPosition ? Number(form.finalPosition) : null,
        completionTimeSeconds: form.completionTimeSeconds ? Number(form.completionTimeSeconds) : null,
        penaltyTimeSeconds: form.penaltyTimeSeconds ? Number(form.penaltyTimeSeconds) : 0,
        status: form.status,
        notes: form.notes.trim() || null,
      });
      showToast("Resultado registrado correctamente.");
      setForm(emptyForm);
      load();
    } catch (error) {
      setFormError(parseApiError(error).message);
    } finally {
      setSubmitting(false);
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
        Resultados — {race?.name}
      </h1>

      <div className="mt-6 overflow-hidden rounded-lg border border-dune-700/15 bg-white">
        {results.length === 0 ? (
          <p className="px-5 py-6 font-body text-sm text-dune-700">
            Todavía no hay resultados registrados para esta carrera.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dune-700/10 font-body text-xs uppercase tracking-wide text-dune-700/60">
                <th className="px-5 py-3">Posición</th>
                <th className="px-5 py-3">Participante</th>
                <th className="px-5 py-3">Tiempo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {[...results]
                .sort((a, b) => (a.finalPosition ?? 999) - (b.finalPosition ?? 999))
                .map((r) => (
                  <tr key={r.id} className="border-b border-dune-700/5 font-body text-sm text-dune-950 last:border-0">
                    <td className="px-5 py-3">{r.finalPosition ?? "—"}</td>
                    <td className="px-5 py-3 font-medium">{r.participantName}</td>
                    <td className="px-5 py-3 text-dune-700">
                      {r.completionTimeSeconds ? `${r.completionTimeSeconds}s` : "—"}
                    </td>
                    <td className="px-5 py-3 text-dune-700">{RESULT_STATUS_LABELS[r.status]}</td>
                    <td className="px-5 py-3 text-dune-700">{r.points}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4 rounded-lg border border-dune-700/15 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-dune-950">Registrar resultado</h2>

          <Select
            id="registrationId"
            label="Inscripción aprobada"
            value={form.registrationId}
            onChange={updateField("registrationId")}
          >
            <option value="">Selecciona una inscripción…</option>
            {pendingRegistrations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.competitorName ?? r.teamName}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-3 gap-4">
            <TextField id="finalPosition" label="Posición final" type="number" value={form.finalPosition} onChange={updateField("finalPosition")} />
            <TextField id="completionTimeSeconds" label="Tiempo (segundos)" type="number" step="0.01" value={form.completionTimeSeconds} onChange={updateField("completionTimeSeconds")} />
            <TextField id="penaltyTimeSeconds" label="Penalización (s)" type="number" step="0.01" value={form.penaltyTimeSeconds} onChange={updateField("penaltyTimeSeconds")} />
          </div>

          <Select id="status" label="Estado del resultado" value={form.status} onChange={updateField("status")}>
            {Object.entries(RESULT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <TextField id="notes" label="Notas (opcional)" value={form.notes} onChange={updateField("notes")} />

          {formError && (
            <div role="alert" className="rounded-md border border-clay-500/30 bg-clay-500/10 px-3.5 py-2.5 font-body text-sm text-clay-600">
              {formError}
            </div>
          )}

          <div className="w-48">
            <Button type="submit" loading={submitting} disabled={!form.registrationId}>
              Guardar resultado
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
