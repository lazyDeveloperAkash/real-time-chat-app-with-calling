import { NextResponse, type NextRequest } from "next/server";

/**
 * Soft auth guard (Next.js 16 `proxy`, formerly `middleware`). Fast redirect
 * based on cookie presence only — real validation happens client-side via the
 * `GET /me` query in AuthGate. `accessToken`/`refreshToken` are httpOnly, so
 * we can only check for their presence here.
 */
const AUTH_PAGES = ["/signin", "/signup", "/forgot-password"];
const PROTECTED = ["/chat", "/settings"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession =
    req.cookies.has("accessToken") || req.cookies.has("refreshToken");

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/chat";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*", "/signin", "/signup", "/forgot-password"],
};
