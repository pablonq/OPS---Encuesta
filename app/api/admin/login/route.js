import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no está configurado en el servidor" },
      { status: 500 }
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await computeAdminToken(expectedPassword, process.env.ADMIN_SESSION_SECRET);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
