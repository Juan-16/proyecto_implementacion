export default function TextField({ label, error, id, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-body text-sm font-medium text-dune-800">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-md border bg-white px-3.5 py-2.5 font-body text-dune-950 outline-none transition
          placeholder:text-dune-700/40 focus:ring-2 focus:ring-amber-500/40
          ${error ? "border-clay-500 focus:border-clay-500" : "border-dune-700/20 focus:border-amber-500"}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="font-body text-sm text-clay-600">
          {error}
        </p>
      )}
    </div>
  );
}
