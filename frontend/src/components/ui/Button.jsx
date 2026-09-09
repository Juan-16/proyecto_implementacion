export default function Button({ children, loading, disabled, ...props }) {
  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-md bg-dune-950 px-4 py-2.5
        font-body text-sm font-semibold text-sand-100 transition hover:bg-dune-900
        disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sand-100/40 border-t-sand-100" />
      )}
      {children}
    </button>
  );
}
