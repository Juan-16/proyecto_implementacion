import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { listCompetitors, deleteCompetitor } from "../../api/competitorApi";
import { parseApiError } from "../../api/httpClient";
import {
  COMPETITOR_TYPE_LABELS,
  COMPETITOR_STATUS_LABELS,
  COMPETITOR_STATUS_STYLES,
} from "../../constants/competitorLabels";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const PAGE_SIZE = 10;

export default function CompetitorsListPage() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const canManage = hasRole("ADMINISTRATOR");

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", type: "", status: "" });
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
      const result = await listCompetitors({ page, size: PAGE_SIZE, ...filters });
      setData(result);
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce simple: espera a que la persona deje de escribir antes de
  // disparar la búsqueda, para no golpear el backend en cada tecla.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  function updateFilter(key) {
    return (event) => {
      setPage(0);
      setFilters((prev) => ({ ...prev, [key]: event.target.value }));
    };
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteCompetitor(pendingDelete.id);
      showToast(
        `${pendingDelete.nickname} fue ${
          pendingDelete.racesCompleted > 0 ? "retirado" : "eliminado"
        } correctamente.`
      );
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
          <h1 className="font-display text-3xl font-semibold text-dune-950">
            Competidores
          </h1>
          <p className="mt-2 font-body text-sm text-dune-700">
            {data.totalElements} competidor{data.totalElements === 1 ? "" : "es"} registrados.
          </p>
        </div>
        {canManage && (
          <Link
            to="/competidores/nuevo"
            className="rounded-md bg-dune-950 px-4 py-2.5 font-body text-sm font-semibold
              text-sand-100 transition hover:bg-dune-900"
          >
            Nuevo competidor
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o apodo…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-[220px] flex-1 rounded-md border border-dune-700/20 bg-white px-3.5 py-2.5
            font-body text-dune-950 outline-none placeholder:text-dune-700/40
            focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
        />
        <Select value={filters.type} onChange={updateFilter("type")}>
          <option value="">Todos los tipos</option>
          {Object.entries(COMPETITOR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={filters.status} onChange={updateFilter("status")}>
          <option value="">Todos los estados</option>
          {Object.entries(COMPETITOR_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-dune-700/15 bg-white">
        {loading ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">
            Cargando competidores…
          </div>
        ) : loadError ? (
          <div className="p-10 text-center font-body text-sm text-clay-600">{loadError}</div>
        ) : data.content.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-body text-sm text-dune-700">
              No hay competidores que coincidan con estos filtros.
            </p>
            {canManage && !filters.search && !filters.type && !filters.status && (
              <Link
                to="/competidores/nuevo"
                className="mt-3 inline-block font-body text-sm font-medium text-amber-600 underline"
              >
                Registra el primero
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dune-700/10 font-body text-xs uppercase tracking-wide text-dune-700/60">
                <th className="px-5 py-3">Apodo</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">País</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-dune-700/5 font-body text-sm text-dune-950 last:border-0 hover:bg-sand-100"
                  onClick={() => navigate(`/competidores/${c.id}`)}
                >
                  <td className="px-5 py-3 font-medium">{c.nickname}</td>
                  <td className="px-5 py-3">{c.name}</td>
                  <td className="px-5 py-3">{COMPETITOR_TYPE_LABELS[c.competitorType]}</td>
                  <td className="px-5 py-3">
                    <Badge className={COMPETITOR_STATUS_STYLES[c.status]}>
                      {COMPETITOR_STATUS_LABELS[c.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-dune-700">{c.countryOfOrigin || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {canManage && (
                      <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/competidores/${c.id}/editar`}
                          className="font-body text-sm font-medium text-amber-600 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setPendingDelete(c)}
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
        title={
          pendingDelete?.racesCompleted > 0
            ? "Retirar competidor"
            : "Eliminar competidor"
        }
        description={
          pendingDelete?.racesCompleted > 0
            ? `${pendingDelete?.nickname} ya tiene carreras oficiales registradas, así que en vez de eliminarse se marcará como RETIRADO.`
            : `¿Seguro que quieres eliminar a ${pendingDelete?.nickname}? Esta acción no se puede deshacer.`
        }
        confirmLabel={pendingDelete?.racesCompleted > 0 ? "Retirar" : "Eliminar"}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
