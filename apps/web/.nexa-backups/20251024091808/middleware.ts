import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/login", "/forgot-password", "/reset-password", "/auth/verify-request", "/api/health"];

function isPublic(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p === "/login") return true;
  if (PUBLIC_PATHS.includes(p)) return true;
  if (p.startsWith("/_next")) return true;
  if (p === "/favicon.ico") return true;
  if (p === "/robots.txt" || p === "/sitemap.xml") return true;
  if (p.startsWith("/brand/")) return true;
  if (p.startsWith("/icons/")) return true;
  if (p.startsWith("/api/auth/")) return true;
  if (p.startsWith("/api/health")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  if (isPublic(req)) return NextResponse.next();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url, { status: 302 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|brand/.*|icons/.*|api/auth/.*|api/health|login|forgot-password).*)",
  ],
};
