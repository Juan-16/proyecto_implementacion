import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/Login/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import AuditLogPage from "./pages/Audit/AuditLogPage";
import CompetitorsListPage from "./pages/Competitors/CompetitorsListPage";
import CompetitorFormPage from "./pages/Competitors/CompetitorFormPage";
import CompetitorDetailPage from "./pages/Competitors/CompetitorDetailPage";
import TeamsListPage from "./pages/Teams/TeamsListPage";
import TeamFormPage from "./pages/Teams/TeamFormPage";
import TeamDetailPage from "./pages/Teams/TeamDetailPage";
import RacesListPage from "./pages/Races/RacesListPage";
import RaceFormPage from "./pages/Races/RaceFormPage";
import RaceDetailPage from "./pages/Races/RaceDetailPage";
import RaceRegistrationsPage from "./pages/Registrations/RaceRegistrationsPage";
import RaceResultsPage from "./pages/Results/RaceResultsPage";
import StandingsPage from "./pages/Standings/StandingsPage";
import AccessDeniedPage from "./pages/AccessDenied/AccessDeniedPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

// Toda página autenticada comparte el mismo shell (sidebar + logout).
// requiredRole es opcional: string o arreglo de roles; si se pasa,
// ProtectedRoute redirige a /acceso-denegado si el usuario no calza.
function ProtectedPage({ requiredRole, children }) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

            <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
            <Route path="/perfil" element={<ProtectedPage><ProfilePage /></ProtectedPage>} />

            <Route
              path="/competidores"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><CompetitorsListPage /></ProtectedPage>}
            />
            <Route
              path="/competidores/nuevo"
              element={<ProtectedPage requiredRole="ADMINISTRATOR"><CompetitorFormPage /></ProtectedPage>}
            />
            <Route
              path="/competidores/:id/editar"
              element={<ProtectedPage requiredRole="ADMINISTRATOR"><CompetitorFormPage /></ProtectedPage>}
            />
            <Route
              path="/competidores/:id"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><CompetitorDetailPage /></ProtectedPage>}
            />

            <Route
              path="/equipos"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><TeamsListPage /></ProtectedPage>}
            />
            <Route
              path="/equipos/nuevo"
              element={<ProtectedPage requiredRole="ADMINISTRATOR"><TeamFormPage /></ProtectedPage>}
            />
            <Route
              path="/equipos/:id/editar"
              element={<ProtectedPage requiredRole="ADMINISTRATOR"><TeamFormPage /></ProtectedPage>}
            />
            <Route
              path="/equipos/:id"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><TeamDetailPage /></ProtectedPage>}
            />

            {/* Carreras: lectura abierta a cualquier rol autenticado (sin requiredRole) */}
            <Route path="/carreras" element={<ProtectedPage><RacesListPage /></ProtectedPage>} />
            <Route
              path="/carreras/nueva"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><RaceFormPage /></ProtectedPage>}
            />
            <Route
              path="/carreras/:id/editar"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><RaceFormPage /></ProtectedPage>}
            />
            <Route path="/carreras/:id" element={<ProtectedPage><RaceDetailPage /></ProtectedPage>} />
            <Route
              path="/carreras/:raceId/inscripciones"
              element={<ProtectedPage requiredRole={["ADMINISTRATOR", "RACE_ORGANIZER"]}><RaceRegistrationsPage /></ProtectedPage>}
            />
            {/* Resultados: lectura abierta a todos; el formulario de captura se oculta solo dentro de la página si el rol no calza */}
            <Route path="/carreras/:raceId/resultados" element={<ProtectedPage><RaceResultsPage /></ProtectedPage>} />

            <Route path="/clasificacion" element={<ProtectedPage><StandingsPage /></ProtectedPage>} />

            <Route
              path="/auditoria"
              element={<ProtectedPage requiredRole="ADMINISTRATOR"><AuditLogPage /></ProtectedPage>}
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
