import axios from "axios";
import { getTokens, saveTokens, clearTokens } from "./tokenStorage";

// En desarrollo, Vite redirige /api al backend real (ver vite.config.js).
// En producción, VITE_API_BASE_URL debe apuntar al host del backend.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const httpClient = axios.create({ baseURL });

httpClient.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Cuando el access token expira, el backend responde 401. Intentamos
// renovar una sola vez con el refresh token antes de rendirnos.
let refreshPromise = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const { refreshToken } = getTokens();

      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${baseURL}/auth/refresh`, { refreshToken })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        saveTokens(data);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Traduce la forma de error del backend (ApiError: timestamp, status, error,
// message, path, fieldErrors) a algo fácil de mostrar en un formulario.
export function parseApiError(error) {
  const data = error.response?.data;
  if (!data) {
    return { message: "No fue posible conectar con el servidor. Intenta de nuevo." };
  }
  return {
    message: data.message || "Ocurrió un error inesperado.",
    fieldErrors: data.fieldErrors || null,
    status: data.status,
  };
}
