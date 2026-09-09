// Un solo lugar para definir qué aparece en el menú y para quién.
// Cuando agreguemos Competidores/Equipos/Carreras, solo se agrega una
// línea aquí — el layout ya filtra por rol automáticamente.
export const NAV_ITEMS = [
  { label: "Panel", path: "/dashboard" },
  { label: "Auditoría", path: "/auditoria", requiredRole: "ADMINISTRATOR" },
];

export const ROLE_LABELS = {
  ADMINISTRATOR: "Administrador",
  RACE_ORGANIZER: "Organizador de carreras",
  VIEWER: "Espectador",
};
