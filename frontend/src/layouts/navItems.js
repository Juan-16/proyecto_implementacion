// Un solo lugar para definir qué aparece en el menú y para quién.
// Cuando agreguemos Competidores/Equipos/Carreras, solo se agrega una
// línea aquí — el layout ya filtra por rol automáticamente.
export const NAV_ITEMS = [
  { label: "Panel", path: "/dashboard" },
  // El backend (CompetitorController) solo permite ver competidores a
  // ADMINISTRATOR y RACE_ORGANIZER — VIEWER no tiene acceso a este endpoint.
  { label: "Competidores", path: "/competidores", requiredRole: ["ADMINISTRATOR", "RACE_ORGANIZER"] },
  { label: "Equipos", path: "/equipos", requiredRole: ["ADMINISTRATOR", "RACE_ORGANIZER"] },
  // Carreras y Standings no tienen @PreAuthorize de GET en el backend:
  // cualquier usuario autenticado (incluido VIEWER) puede verlas.
  { label: "Carreras", path: "/carreras" },
  { label: "Clasificación", path: "/clasificacion" },
  { label: "Auditoría", path: "/auditoria", requiredRole: "ADMINISTRATOR" },
];

export const ROLE_LABELS = {
  ADMINISTRATOR: "Administrador",
  RACE_ORGANIZER: "Organizador de carreras",
  VIEWER: "Espectador",
};
