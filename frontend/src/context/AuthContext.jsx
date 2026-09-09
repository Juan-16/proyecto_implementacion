import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/authApi";
import { getTokens, saveTokens, clearTokens } from "../api/tokenStorage";
import { parseApiError } from "../api/httpClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "checking" evita un parpadeo hacia /login mientras se valida un token
  // que ya existía en localStorage (por ejemplo, al refrescar la página).
  const [status, setStatus] = useState("checking");

  const loadProfile = useCallback(async () => {
    try {
      const profile = await authApi.fetchProfile();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      clearTokens();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      loadProfile();
    } else {
      setStatus("guest");
    }
  }, [loadProfile]);

  async function login(username, password) {
    try {
      const tokens = await authApi.login(username, password);
      saveTokens(tokens);
      await loadProfile();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: parseApiError(error) };
    }
  }

  function logout() {
    clearTokens();
    setUser(null);
    setStatus("guest");
  }

  const value = {
    user,
    roles: user?.roles ?? [],
    isAuthenticated: status === "authenticated",
    isChecking: status === "checking",
    hasRole: (role) => user?.roles?.includes(role) ?? false,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
