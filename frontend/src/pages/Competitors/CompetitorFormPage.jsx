import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCompetitor, createCompetitor, updateCompetitor } from "../../api/competitorApi";
import { parseApiError } from "../../api/httpClient";
import { useToast } from "../../context/ToastContext";
import { COMPETITOR_TYPE_LABELS } from "../../constants/competitorLabels";
import TextField from "../../components/ui/TextField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const emptyForm = {
  name: "",
  nickname: "",
  competitorType: "",
  dateOfBirth: "",
  approximateAge: "",
  weight: "",
  height: "",
  countryOfOrigin: "",
};

export default function CompetitorFormPage() {
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
    getCompetitor(id)
      .then((c) =>
        setForm({
          name: c.name,
          nickname: c.nickname,
          competitorType: c.competitorType,
          dateOfBirth: c.dateOfBirth ?? "",
          approximateAge: c.approximateAge ?? "",
          weight: c.weight ?? "",
          height: c.height ?? "",
          countryOfOrigin: c.countryOfOrigin ?? "",
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

  function buildPayload() {
    return {
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      competitorType: form.competitorType,
      dateOfBirth: form.dateOfBirth || null,
      approximateAge: form.approximateAge ? Number(form.approximateAge) : null,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      countryOfOrigin: form.countryOfOrigin.trim() || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateCompetitor(id, payload);
        showToast("Competidor actualizado correctamente.");
      } else {
        await createCompetitor(payload);
        showToast("Competidor creado correctamente.");
      }
      navigate("/competidores");
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors);
      } else {
        setFormError(parsed.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="font-body text-sm text-dune-700">Cargando…</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        {isEdit ? "Editar competidor" : "Nuevo competidor"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="name"
            label="Nombre"
            value={form.name}
            onChange={updateField("name")}
            error={fieldErrors.name}
          />
          <TextField
            id="nickname"
            label="Apodo (único)"
            value={form.nickname}
            onChange={updateField("nickname")}
            error={fieldErrors.nickname}
          />
        </div>

        <Select
          id="competitorType"
          label="Tipo de competidor"
          value={form.competitorType}
          onChange={updateField("competitorType")}
          disabled={isEdit}
          required
        >
          <option value="" disabled>
            Selecciona un tipo…
          </option>
          {Object.entries(COMPETITOR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {isEdit && (
          <p className="-mt-3 font-body text-xs text-dune-700/60">
            El tipo no se puede cambiar una vez creado el competidor.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="weight"
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={form.weight}
            onChange={updateField("weight")}
            error={fieldErrors.weight}
          />
          <TextField
            id="height"
            label="Altura (cm)"
            type="number"
            step="0.1"
            value={form.height}
            onChange={updateField("height")}
            error={fieldErrors.height}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="dateOfBirth"
            label="Fecha de nacimiento"
            type="date"
            value={form.dateOfBirth}
            onChange={updateField("dateOfBirth")}
            error={fieldErrors.dateOfBirth}
          />
          <TextField
            id="approximateAge"
            label="Edad aproximada"
            type="number"
            value={form.approximateAge}
            onChange={updateField("approximateAge")}
            error={fieldErrors.approximateAge}
          />
        </div>

        <TextField
          id="countryOfOrigin"
          label="País o lugar de origen"
          value={form.countryOfOrigin}
          onChange={updateField("countryOfOrigin")}
          error={fieldErrors.countryOfOrigin}
        />

        {formError && (
          <div role="alert" className="rounded-md border border-clay-500/30 bg-clay-500/10 px-3.5 py-2.5 font-body text-sm text-clay-600">
            {formError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/competidores")}
            className="flex-1 rounded-md border border-dune-700/20 px-4 py-2.5 font-body text-sm
              font-semibold text-dune-800 transition hover:bg-dune-700/5"
          >
            Cancelar
          </button>
          <div className="flex-1">
            <Button type="submit" loading={submitting}>
              {isEdit ? "Guardar cambios" : "Crear competidor"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
