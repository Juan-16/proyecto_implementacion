import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand-100 px-6 text-center">
      <p className="font-display text-5xl font-semibold text-dune-950">404</p>
      <p className="font-body text-sm text-dune-700">
        Esta pista no existe — ni los camellos la encuentran.
      </p>
      <Link to="/dashboard" className="font-body text-sm font-medium text-amber-600 underline">
        Volver al panel
      </Link>
    </div>
  );
}
