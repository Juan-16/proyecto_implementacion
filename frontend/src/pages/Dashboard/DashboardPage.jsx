import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SHORTCUTS = [
  { label: "Competidores", path: "/competidores", roles: ["ADMINISTRATOR", "RACE_ORGANIZER"] },
  { label: "Equipos", path: "/equipos", roles: ["ADMINISTRATOR", "RACE_ORGANIZER"] },
  { label: "Carreras", path: "/carreras" },
  { label: "Clasificación", path: "/clasificacion" },
];

// El resumen "de verdad" (próximas carreras, competidores activos,
// resultados recientes) se puede enriquecer más adelante combinando los
// endpoints existentes; por ahora, accesos directos a cada módulo.
export default function DashboardPage() {
  const { user, hasAnyRole } = useAuth();
  const visible = SHORTCUTS.filter((s) => !s.roles || hasAnyRole(s.roles));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        Bienvenido, {user?.fullName ?? user?.username}
      </h1>
      <p className="mt-2 font-body text-sm text-dune-700">
        Accede rápido a lo que necesites gestionar.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {visible.map((s) => (
          <Link
            key={s.path}
            to={s.path}
            className="rounded-lg border border-dune-700/15 bg-white p-5 font-body text-sm font-medium
              text-dune-950 transition hover:border-amber-500/40 hover:bg-amber-500/5"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
