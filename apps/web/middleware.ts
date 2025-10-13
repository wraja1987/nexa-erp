// Auto-generated middleware: API-only CORS allow-list (APP_CORS_ORIGINS)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Security headers for all routes
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains; preload");

  const url = req.nextUrl;
  if (url.pathname.startsWith("/api")) {
    const origin = req.headers.get("origin") || "";
    const allow = (process.env.APP_CORS_ORIGINS || "").split(",").map(s=>s.trim()).filter(Boolean);
    if (allow.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Vary", "Origin");
      res.headers.set("Access-Control-Allow-Credentials", "true");
    }
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: res.headers });
  }
  return res;
}
export const config = { matcher: ["/:path*"] };
