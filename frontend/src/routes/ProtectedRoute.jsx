import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Se usará a partir del dashboard en adelante:
// <Route element={<ProtectedRoute />}><Route path="/dashboard" ... /></Route>
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isChecking, hasAnyRole } = useAuth();

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-100">
        <p className="font-body text-sm text-dune-700">Verificando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasAnyRole(requiredRole)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
}
