import { useCallback, useEffect, useState } from "react";
import { listAuditLogs } from "../../api/auditApi";
import { parseApiError } from "../../api/httpClient";
import Pagination from "../../components/ui/Pagination";

const PAGE_SIZE = 15;

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await listAuditLogs({ page, size: PAGE_SIZE }));
    } catch (error) {
      setLoadError(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        Bitácora de auditoría
      </h1>
      <p className="mt-2 font-body text-sm text-dune-700">
        Registro de acciones sensibles del sistema. Solo visible para administradores.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-dune-700/15 bg-white">
        {loading ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">Cargando…</div>
        ) : loadError ? (
          <div className="p-10 text-center font-body text-sm text-clay-600">{loadError}</div>
        ) : data.content.length === 0 ? (
          <div className="p-10 text-center font-body text-sm text-dune-700">
            No hay eventos registrados todavía.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dune-700/10 font-body text-xs uppercase tracking-wide text-dune-700/60">
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Acción</th>
                <th className="px-5 py-3">Entidad</th>
                <th className="px-5 py-3">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((log) => (
                <tr key={log.id} className="border-b border-dune-700/5 font-body text-sm text-dune-950 last:border-0">
                  <td className="px-5 py-3 text-dune-700">
                    {new Date(log.occurredAt).toLocaleString("es-CO")}
                  </td>
                  <td className="px-5 py-3">{log.username}</td>
                  <td className="px-5 py-3">{log.action}</td>
                  <td className="px-5 py-3 text-dune-700">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="px-5 py-3 text-dune-700">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
