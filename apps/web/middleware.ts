// Nexa ERP — Auth/runtime hardening. Do not relax these routes without updating .cursorrules.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/auth/",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/.well-known",
  "/_next",
  "/favicon.ico",
  "/logo-nexa.png",
  "/public",
  "/assets",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Security headers quick pass
  const resHeaders: Record<string,string> = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'Permissions-Policy': 'geolocation=()'
  };

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
  if (isPublic) {
    const r = NextResponse.next();
    Object.entries(resHeaders).forEach(([k,v])=>r.headers.set(k,v));
    return r;
  }

  const token =
    req.cookies.get("__Secure-next-auth.session-token") ||
    req.cookies.get("next-auth.session-token");

  // If hitting /login while authenticated → go to /dashboard
  if (pathname === "/login" && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    const r = NextResponse.redirect(url);
    Object.entries(resHeaders).forEach(([k,v])=>r.headers.set(k,v));
    return r;
  }

  // For all other app routes, require session
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const r = NextResponse.redirect(url);
    Object.entries(resHeaders).forEach(([k,v])=>r.headers.set(k,v));
    return r;
  }

  const r = NextResponse.next();
  Object.entries(resHeaders).forEach(([k,v])=>r.headers.set(k,v));
  return r;
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};
