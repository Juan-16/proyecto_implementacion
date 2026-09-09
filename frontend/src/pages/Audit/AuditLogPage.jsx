// Módulo 8 del enunciado. Se construye completo más adelante; por ahora
// existe para demostrar la protección por rol de punta a punta: el enlace
// del menú ya está oculto para quien no sea ADMINISTRATOR (ver navItems.js
// y AppLayout), y si alguien entra directo por URL, ProtectedRoute lo
// redirige a /acceso-denegado antes de que este componente se renderice.
export default function AuditLogPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        Bitácora de auditoría
      </h1>
      <p className="mt-2 font-body text-sm text-dune-700">
        Próximamente: registro de acciones sensibles (login, cambios de
        estado, decisiones de inscripción, resultados).
      </p>
    </div>
  );
}
