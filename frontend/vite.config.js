import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El backend (SecurityConfig) todavía no define una política CORS.
// Mientras el equipo la agrega, este proxy evita el problema en desarrollo:
// el navegador ve todo como el mismo origen (localhost:5173) y Vite reenvía
// las llamadas /api/** al backend real.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
