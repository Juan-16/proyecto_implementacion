import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand-100 px-6 text-center">
      <p className="font-display text-2xl text-dune-950">Acceso denegado</p>
      <p className="font-body text-sm text-dune-700">
        Tu rol no tiene permiso para ver esta sección.
      </p>
      <Link to="/dashboard" className="font-body text-sm font-medium text-amber-600 underline">
        Volver al panel
      </Link>
    </div>
  );
}
