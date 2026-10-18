import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "@/lib/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Único endpoint de datos público: el envío de la encuesta por parte de los operadores.
  if (pathname === "/api/respuestas" && request.method === "POST") {
    return NextResponse.next();
  }

  const expectedToken = await getExpectedAdminToken();
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!expectedToken || cookieToken !== expectedToken) {
    if (isApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/capacitaciones/:path*",
    "/api/instructores/:path*",
    "/api/respuestas/:path*",
  ],
};
