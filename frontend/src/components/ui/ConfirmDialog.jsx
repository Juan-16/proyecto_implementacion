import Button from "./Button";

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirmar", onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dune-950/50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="font-display text-xl font-semibold text-dune-950">{title}</h2>
        <p className="mt-2 font-body text-sm text-dune-700">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-md border border-dune-700/20 px-4 py-2.5 font-body text-sm
              font-semibold text-dune-800 transition hover:bg-dune-700/5 disabled:opacity-60"
          >
            Cancelar
          </button>
          <div className="flex-1">
            <Button onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
