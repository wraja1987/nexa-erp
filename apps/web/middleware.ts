import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OAUTH_PATHS = [
  "/api/auth",
  "/api/auth/",
  "/api/auth/signin",
  "/api/auth/signin/google",
  "/api/auth/signin/azure-ad",
  "/api/auth/callback/google",
  "/api/auth/callback/azure-ad",
  "/api/auth/session",
  "/api/auth/csrf",
  "/login",
  "/favicon.ico",
  "/_next/",
  "/robots.txt",
  "/sitemap.xml",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // log hits for verification
  console.log("NEXA_MW_HIT", {
    path: pathname,
    cookies: req.cookies.getAll().map((c) => c.name),
  });

  // bypass all OAuth/auth/public routes
  if (OAUTH_PATHS.some((p) => pathname.startsWith(p))) {
    console.log("NEXA_MW_BYPASS", { path: pathname });
    return NextResponse.next();
  }

  // enforce session for all others
  const session =
    req.cookies.get("__Secure-next-auth.session-token") ||
    req.cookies.get("next-auth.session-token");

  if (!session) {
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
