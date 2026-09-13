import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS, ROLE_LABELS } from "./navItems";

export default function AppLayout({ children }) {
  const { user, roles, hasAnyRole, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRole || hasAnyRole(item.requiredRole)
  );

  return (
    <div className="flex min-h-screen bg-sand-100">
      <aside className="flex w-64 flex-col justify-between bg-dune-950 px-5 py-6">
        <div>
          <p className="px-2 font-display text-lg font-semibold text-sand-100">
            EIA Racing League
          </p>

          <nav className="mt-8 flex flex-col gap-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 font-body text-sm transition ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-sand-300/80 hover:bg-dune-900 hover:text-sand-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-dune-700/60 pt-4">
          <NavLink
            to="/perfil"
            className="flex flex-col gap-0.5 rounded-md px-2 py-2 hover:bg-dune-900"
          >
            <span className="font-body text-sm font-medium text-sand-100">
              {user?.fullName ?? user?.username}
            </span>
            <span className="font-body text-xs text-sand-300/60">
              {roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}
            </span>
          </NavLink>
          <button
            onClick={logout}
            className="mt-2 w-full rounded-md px-3 py-2 text-left font-body text-sm text-sand-300/80
              transition hover:bg-dune-900 hover:text-clay-500"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  );
}
