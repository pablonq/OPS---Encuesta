// Gate simple de administración basado en una contraseña compartida (env var).
// No es un sistema de usuarios: alcanza para uso interno del equipo de OPS.
// Usa Web Crypto (disponible tanto en runtime Node como Edge) para no
// depender del módulo "crypto" de Node dentro del middleware.

export const ADMIN_COOKIE_NAME = "ops_admin";

export async function computeAdminToken(password, sessionSecret) {
  const raw = `${password}::${sessionSecret || "ops-default-secret"}`;
  const encoded = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return computeAdminToken(password, process.env.ADMIN_SESSION_SECRET);
}
