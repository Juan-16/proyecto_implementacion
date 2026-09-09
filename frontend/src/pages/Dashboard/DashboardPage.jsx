import { useAuth } from "../../context/AuthContext";

// El resumen real (próximas carreras, competidores activos, resultados
// recientes) se conecta cuando existan esos módulos. Usuario, roles y
// logout ahora viven en AppLayout, así que este componente solo es el
// contenido de la página.
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        Bienvenido, {user?.fullName ?? user?.username}
      </h1>
      <p className="mt-2 font-body text-sm text-dune-700">
        Aquí vivirá el resumen de próximas carreras, competidores activos y
        resultados recientes.
      </p>
    </div>
  );
}
