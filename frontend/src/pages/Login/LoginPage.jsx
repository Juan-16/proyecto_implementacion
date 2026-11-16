import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import BrandPanel from "./BrandPanel";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(key) {
    return (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function validate() {
    const errors = {};
    if (!form.username.trim()) errors.username = "Ingresa tu nombre de usuario.";
    if (!form.password) errors.password = "Ingresa tu contraseña.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    const result = await login(form.username.trim(), form.password);
    setSubmitting(false);

    if (result.ok) {
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
      return;
    }

    // El backend devuelve 401 genérico para credenciales inválidas (no
    // distingue campo), así que lo mostramos como mensaje general.
    if (result.error.fieldErrors) {
      setFieldErrors(result.error.fieldErrors);
    } else {
      setFormError(result.error.message);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <BrandPanel />

      <div className="flex items-center justify-center bg-sand-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold text-dune-950">
            Inicia sesión
          </h1>
          <p className="mt-2 font-body text-sm text-dune-700">
            Accede para gestionar competidores, equipos y carreras.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <TextField
              id="username"
              label="Usuario"
              type="text"
              autoComplete="username"
              placeholder="ej. abandonado_ceo"
              value={form.username}
              onChange={updateField("username")}
              error={fieldErrors.username}
              disabled={submitting}
            />
            <TextField
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={updateField("password")}
              error={fieldErrors.password}
              disabled={submitting}
            />

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-clay-500/30 bg-clay-500/10 px-3.5 py-2.5 font-body text-sm text-clay-600"
              >
                {formError}
              </div>
            )}

            <Button type="submit" loading={submitting}>
              {submitting ? "Verificando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
