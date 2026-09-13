export default function Select({ label, id, children, ...selectProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-body text-sm font-medium text-dune-800">
          {label}
        </label>
      )}
      <select
        id={id}
        className="rounded-md border border-dune-700/20 bg-white px-3.5 py-2.5 font-body text-dune-950
          outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
        {...selectProps}
      >
        {children}
      </select>
    </div>
  );
}
