export const RACE_TYPE_LABELS = {
  INDIVIDUAL: "Individual",
  TEAM: "Por equipos",
  MIXED: "Mixta",
};

export const RACE_STATUS_LABELS = {
  DRAFT: "Borrador",
  OPEN_FOR_REGISTRATION: "Inscripciones abiertas",
  CLOSED_FOR_REGISTRATION: "Inscripciones cerradas",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const RACE_STATUS_STYLES = {
  DRAFT: "bg-dune-700/15 text-dune-700",
  OPEN_FOR_REGISTRATION: "bg-pine-500/15 text-pine-600",
  CLOSED_FOR_REGISTRATION: "bg-amber-500/15 text-amber-600",
  IN_PROGRESS: "bg-amber-500/25 text-amber-600",
  COMPLETED: "bg-pine-600/20 text-pine-600",
  CANCELLED: "bg-clay-500/15 text-clay-600",
};

// Transiciones de estado permitidas por RaceService, para no ofrecer en la
// UI opciones que el backend va a rechazar de todos modos.
export const RACE_STATUS_TRANSITIONS = {
  DRAFT: ["OPEN_FOR_REGISTRATION", "CANCELLED"],
  OPEN_FOR_REGISTRATION: ["CLOSED_FOR_REGISTRATION", "CANCELLED"],
  CLOSED_FOR_REGISTRATION: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const REGISTRATION_STATUS_LABELS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export const REGISTRATION_STATUS_STYLES = {
  PENDING: "bg-amber-500/15 text-amber-600",
  APPROVED: "bg-pine-500/15 text-pine-600",
  REJECTED: "bg-clay-500/15 text-clay-600",
  CANCELLED: "bg-dune-700/15 text-dune-700",
};

export const RESULT_STATUS_LABELS = {
  FINISHED: "Finalizó",
  DISQUALIFIED: "Descalificado",
  DID_NOT_FINISH: "No terminó",
  DID_NOT_START: "No se presentó",
};

export const TEAM_STATUS_LABELS = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  INACTIVE: "Inactivo",
};

export const TEAM_STATUS_STYLES = {
  ACTIVE: "bg-pine-500/15 text-pine-600",
  SUSPENDED: "bg-clay-500/15 text-clay-600",
  INACTIVE: "bg-dune-700/15 text-dune-700",
};
