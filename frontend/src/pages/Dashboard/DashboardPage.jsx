import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

// Placeholder mínimo solo para poder probar el flujo de login de punta a
// punta. El dashboard real (módulo 7) se construye en el siguiente paso.
export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand-100 px-6 text-center">
      <p className="font-display text-2xl text-dune-950">
        Bienvenido, {user?.fullName ?? user?.username}
      </p>
      <p className="font-body text-sm text-dune-700">
        Roles: {user?.roles?.join(", ") || "sin roles"}
      </p>
      <div className="w-40">
        <Button onClick={logout}>Cerrar sesión</Button>
      </div>
    </div>
  );
}
