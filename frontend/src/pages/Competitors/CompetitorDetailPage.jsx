import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getCompetitor, updateCompetitorStatus } from "../../api/competitorApi";
import { parseApiError } from "../../api/httpClient";
import {
  COMPETITOR_TYPE_LABELS,
  COMPETITOR_STATUS_LABELS,
  COMPETITOR_STATUS_STYLES,
} from "../../constants/competitorLabels";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";

function Field({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs uppercase tracking-wide text-dune-700/60">{label}</p>
      <p className="mt-1 font-body text-base text-dune-950">{value ?? "—"}</p>
    </div>
  );
}

export default function CompetitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canManage = hasRole("ADMINISTRATOR");

  const [competitor, setCompetitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    getCompetitor(id)
      .then(setCompetitor)
      .catch((error) => setLoadError(parseApiError(error).message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(event) {
    const newStatus = event.target.value;
    setChangingStatus(true);
    try {
      const updated = await updateCompetitorStatus(id, newStatus);
      setCompetitor(updated);
      showToast("Estado actualizado correctamente.");
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) return <p className="font-body text-sm text-dune-700">Cargando…</p>;
  if (loadError) return <p className="font-body text-sm text-clay-600">{loadError}</p>;
  if (!competitor) return null;

  return (
    <div className="max-w-2xl">
      <Link to="/competidores" className="font-body text-sm text-dune-700 hover:underline">
        ← Volver al listado
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-dune-950">
            {competitor.nickname}
          </h1>
          <p className="mt-1 font-body text-sm text-dune-700">{competitor.name}</p>
        </div>
        <Badge className={COMPETITOR_STATUS_STYLES[competitor.status]}>
          {COMPETITOR_STATUS_LABELS[competitor.status]}
        </Badge>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 rounded-lg border border-dune-700/15 bg-white p-6">
        <Field label="Tipo" value={COMPETITOR_TYPE_LABELS[competitor.competitorType]} />
        <Field label="País de origen" value={competitor.countryOfOrigin} />
        <Field label="Peso" value={competitor.weight ? `${competitor.weight} kg` : null} />
        <Field label="Altura" value={competitor.height ? `${competitor.height} cm` : null} />
        <Field label="Fecha de nacimiento" value={competitor.dateOfBirth} />
        <Field label="Edad aproximada" value={competitor.approximateAge} />
        <Field label="Fecha de registro" value={competitor.registrationDate} />
        <Field
          label="Historial"
          value={`${competitor.victories} victorias · ${competitor.defeats} derrotas · ${competitor.racesCompleted} carreras`}
        />
      </div>

      {canManage && (
        <div className="mt-6 max-w-xs">
          <Select
            id="status"
            label="Cambiar estado"
            value={competitor.status}
            onChange={handleStatusChange}
            disabled={changingStatus}
          >
            {Object.entries(COMPETITOR_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {canManage && (
        <button
          onClick={() => navigate(`/competidores/${id}/editar`)}
          className="mt-6 font-body text-sm font-medium text-amber-600 hover:underline"
        >
          Editar datos del competidor
        </button>
      )}
    </div>
  );
}
