import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/favicon.ico",
  "/icons",
  "/images",
  "/assets",
  "/logo-nexa.png",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/)
  ) {
    // Minimal log to prove allowlist
    console.log("[mw] allow", pathname);
    return NextResponse.next();
  }

  // Read token explicitly from dev cookie name for NextAuth v4 JWT strategy
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: false,
    cookieName: "next-auth.session-token", // dev/HTTP cookie name
  });

  // Lightweight diagnostics: what cookies exist, do we have a token?
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  console.log("[mw] path", pathname, "cookies", cookieNames, "hasToken", Boolean(token));

  if (token) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  console.log("[mw] redirect", pathname, "→", url.toString());
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api/auth|icons|images|favicon.ico).*)"],
};
