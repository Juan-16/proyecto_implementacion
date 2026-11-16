import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../layouts/navItems";

function Field({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs uppercase tracking-wide text-dune-700/60">
        {label}
      </p>
      <p className="mt-1 font-body text-base text-dune-950">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, roles } = useAuth();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-semibold text-dune-950">
        Tu perfil
      </h1>
      <p className="mt-2 font-body text-sm text-dune-700">
        Esta es la información asociada a tu cuenta en la liga.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6 rounded-lg border border-dune-700/15 bg-white p-6">
        <Field label="Nombre completo" value={user?.fullName ?? "—"} />
        <Field label="Usuario" value={user?.username ?? "—"} />
        <Field label="Correo" value={user?.email ?? "—"} />
        <Field
          label="Roles"
          value={roles.map((r) => ROLE_LABELS[r] ?? r).join(", ") || "—"}
        />
      </div>
    </div>
  );
}
