import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { listRaces, deleteRace } from "../../api/raceApi";
import { parseApiError } from "../../api/httpClient";
import {
  RACE_TYPE_LABELS,
  RACE_STATUS_LABELS,
  RACE_STATUS_STYLES,
} from "../../constants/raceLabels";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const PAGE_SIZE = 10;

export default function RacesListPage() {
  const { hasRole, hasAnyRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const canCreate = hasAnyRole(["ADMINISTRATOR", "RACE_ORGANIZER"]);
  const canDelete = hasRole("ADMINISTRATOR");

  const [filters, setFilters] = useState({ type: "", status: "" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await listRaces({ page, size: PAGE_SIZE, ...filters }));
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  function updateFilter(key) {
    return (event) => {
      setPage(0);
      setFilters((prev) => ({ ...prev, [key]: event.target.value }));
    };
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteRace(pendingDelete.id);
      showToast(`"${pendingDelete.name}" fue eliminada correctamente.`);
      setPendingDelete(null);
      load();
    } catch (error) {
      showToast(parseApiError(error).message, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-dune-950">Carreras</h1>
          <p className="mt-2 font-body text-sm text-dune-700">
            {data.totalElements} carrera{data.totalElements === 1 ? "" : "s"} registradas.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/carreras/nueva"
            className="rounded-md bg-dune-950 px-4 py-2.5 font-body text-sm font-semibold text-sand-100 transition hover:bg-dune-900"
          >
            Nueva carrera
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={filters.type} onChange={updateFilter("type")}>
          <option value="">Todos los tipos</option>
          {Object.entries(RACE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={filters.status} onChange={updateFilter("status")}>
          <option value="">Todos los estados</option>
          {Object.entries(RACE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-dune-700/15 bg-white">
        {loading ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">Cargando carreras…</div>
        ) : loadError ? (
          <div className="p-10 text-center font-body text-sm text-clay-600">{loadError}</div>
        ) : data.content.length === 0 ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">
            No hay carreras que coincidan con estos filtros.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dune-700/10 font-body text-xs uppercase tracking-wide text-dune-700/60">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-b border-dune-700/5 font-body text-sm text-dune-950 last:border-0 hover:bg-sand-100"
                  onClick={() => navigate(`/carreras/${r.id}`)}
                >
                  <td className="px-5 py-3 font-medium">{r.name}</td>
                  <td className="px-5 py-3 text-dune-700">
                    {r.scheduledAt ? new Date(r.scheduledAt).toLocaleString("es-CO") : "—"}
                  </td>
                  <td className="px-5 py-3">{RACE_TYPE_LABELS[r.raceType]}</td>
                  <td className="px-5 py-3">
                    <Badge className={RACE_STATUS_STYLES[r.status]}>
                      {RACE_STATUS_LABELS[r.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canDelete && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setPendingDelete(r)}
                          className="font-body text-sm font-medium text-clay-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar carrera"
        description={`¿Seguro que quieres eliminar "${pendingDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
