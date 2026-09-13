export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-dune-700/10 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="rounded-md px-3 py-1.5 font-body text-sm text-dune-800 transition
          hover:bg-dune-700/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="font-body text-sm text-dune-700">
        Página {page + 1} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
        className="rounded-md px-3 py-1.5 font-body text-sm text-dune-800 transition
          hover:bg-dune-700/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}
