import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam, createTeam, updateTeam } from "../../api/teamApi";
import { parseApiError } from "../../api/httpClient";
import { useToast } from "../../context/ToastContext";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";

const emptyForm = { name: "", description: "", coachName: "" };

export default function TeamFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getTeam(id)
      .then((t) =>
        setForm({
          name: t.name,
          description: t.description ?? "",
          coachName: t.coachName ?? "",
        })
      )
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
        coachName: form.coachName.trim() || null,
      };
      if (isEdit) {
        await updateTeam(id, payload);
        showToast("Equipo actualizado correctamente.");
      } else {
        await createTeam(payload);
        showToast("Equipo creado correctamente.");
      }
      navigate("/equipos");
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) setFieldErrors(parsed.fieldErrors);
      else setFormError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="font-body text-sm text-dune-700">Cargando…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        {isEdit ? "Editar equipo" : "Nuevo equipo"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <TextField
          id="name"
          label="Nombre del equipo (único)"
          value={form.name}
          onChange={updateField("name")}
          error={fieldErrors.name}
        />
        <TextField
          id="coachName"
          label="Entrenador o responsable"
          value={form.coachName}
          onChange={updateField("coachName")}
          error={fieldErrors.coachName}
        />
        <TextField
          id="description"
          label="Descripción"
          value={form.description}
          onChange={updateField("description")}
          error={fieldErrors.description}
        />

        {formError && (
          <div role="alert" className="rounded-md border border-clay-500/30 bg-clay-500/10 px-3.5 py-2.5 font-body text-sm text-clay-600">
            {formError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/equipos")}
            className="flex-1 rounded-md border border-dune-700/20 px-4 py-2.5 font-body text-sm font-semibold text-dune-800 transition hover:bg-dune-700/5"
          >
            Cancelar
          </button>
          <div className="flex-1">
            <Button type="submit" loading={submitting}>
              {isEdit ? "Guardar cambios" : "Crear equipo"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
