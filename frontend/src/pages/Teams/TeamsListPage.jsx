import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { listTeams, deleteTeam } from "../../api/teamApi";
import { parseApiError } from "../../api/httpClient";
import { TEAM_STATUS_LABELS, TEAM_STATUS_STYLES } from "../../constants/raceLabels";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const PAGE_SIZE = 10;

export default function TeamsListPage() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const canManage = hasRole("ADMINISTRATOR");

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
      setData(await listTeams({ page, size: PAGE_SIZE }));
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteTeam(pendingDelete.id);
      showToast(`${pendingDelete.name} fue eliminado o desactivado correctamente.`);
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
          <h1 className="font-display text-3xl font-semibold text-dune-950">Equipos</h1>
          <p className="mt-2 font-body text-sm text-dune-700">
            {data.totalElements} equipo{data.totalElements === 1 ? "" : "s"} registrados.
          </p>
        </div>
        {canManage && (
          <Link
            to="/equipos/nuevo"
            className="rounded-md bg-dune-950 px-4 py-2.5 font-body text-sm font-semibold text-sand-100 transition hover:bg-dune-900"
          >
            Nuevo equipo
          </Link>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-dune-700/15 bg-white">
        {loading ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">Cargando equipos…</div>
        ) : loadError ? (
          <div className="p-10 text-center font-body text-sm text-clay-600">{loadError}</div>
        ) : data.content.length === 0 ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">
            Todavía no hay equipos registrados.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dune-700/10 font-body text-xs uppercase tracking-wide text-dune-700/60">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Entrenador</th>
                <th className="px-5 py-3">Miembros</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer border-b border-dune-700/5 font-body text-sm text-dune-950 last:border-0 hover:bg-sand-100"
                  onClick={() => navigate(`/equipos/${t.id}`)}
                >
                  <td className="px-5 py-3 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-dune-700">{t.coachName || "—"}</td>
                  <td className="px-5 py-3 text-dune-700">{t.members?.length ?? 0}</td>
                  <td className="px-5 py-3">
                    <Badge className={TEAM_STATUS_STYLES[t.status]}>
                      {TEAM_STATUS_LABELS[t.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canManage && (
                      <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/equipos/${t.id}/editar`}
                          className="font-body text-sm font-medium text-amber-600 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setPendingDelete(t)}
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
        title="Eliminar equipo"
        description={`¿Seguro que quieres eliminar a ${pendingDelete?.name}? Si tiene historial oficial de carreras, el backend lo desactivará en vez de borrarlo.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
