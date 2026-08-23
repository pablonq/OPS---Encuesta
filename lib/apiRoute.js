import { NextResponse } from "next/server";

// Envuelve un handler de API route para que cualquier excepción no atrapada
// (por ejemplo, un fallo de red al llamar a Supabase) devuelva JSON en vez
// de la página de error HTML por defecto de Next.js.
export function apiRoute(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      return NextResponse.json(
        { error: err?.message || "Error inesperado en el servidor" },
        { status: 500 }
      );
    }
  };
}
