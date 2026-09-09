// Guardado simple en localStorage. Es un proyecto académico con demo en
// vivo; si más adelante se necesita mayor seguridad, esto se reemplaza por
// cookies httpOnly emitidas por el backend, sin tocar el resto del código
// porque todo pasa por estas tres funciones.
const ACCESS_KEY = "racingleague.accessToken";
const REFRESH_KEY = "racingleague.refreshToken";

export function getTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
