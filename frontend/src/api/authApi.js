import { httpClient } from "./httpClient";

// Coincide exactamente con AuthController / AuthService del backend.
export async function login(username, password) {
  const { data } = await httpClient.post("/auth/login", { username, password });
  return data; // AuthResponse: accessToken, refreshToken, tokenType, expiresIn
}

export async function register({ username, email, password, fullName }) {
  const { data } = await httpClient.post("/auth/register", {
    username,
    email,
    password,
    fullName,
  });
  return data; // UserProfileResponse — queda con rol VIEWER por defecto
}

export async function fetchProfile() {
  const { data } = await httpClient.get("/auth/profile");
  return data; // UserProfileResponse: id, username, email, fullName, roles[]
}
