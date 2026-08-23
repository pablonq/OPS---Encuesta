import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "@/lib/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expectedToken = await getExpectedAdminToken();
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!expectedToken || cookieToken !== expectedToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
