import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_FREE = [
  "/login",
  "/api/auth/csrf",
  "/api/auth/providers",
  "/api/auth/signin",
  "/api/auth/signin/google",
  "/api/auth/signin/azure-ad",
  "/api/auth/callback/google",
  "/api/auth/callback/azure-ad",
  "/api/auth/callback/credentials",
  "/api/auth/error",
  "/(public)/forgot-password",
  "/forgot-password",
  "/_next",
  "/favicon.ico",
  "/logo-nexa.png",
  "/Nexa.png"
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow all auth + public + static
  if (
    AUTH_FREE.some((p) => pathname === p || pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // session check
  const hasSession =
    req.cookies.get("__Secure-next-auth.session-token") ||
    req.cookies.get("next-auth.session-token");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
