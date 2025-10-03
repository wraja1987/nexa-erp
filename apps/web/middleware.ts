import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/api/auth/signin",
    "/api/auth/callback/:path*",
    "/api/auth/reset-password",
    "/api/kpi/:path*",
  ],
};

const windowSec = Number(process.env.RATE_LIMIT_WINDOW_SEC || 60);
const max = Number(process.env.RATE_LIMIT_MAX || 100);

// Lightweight in-memory fallback for dev only (edge runtimes cannot use Node Redis).
// In prod, rely on API handlers RL (above) for strict enforcement on KPI/reset,
// and keep middleware as a coarse guard for sign-in bursts.
const devCounts = new Map<string, { t: number; c: number }>();

export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return NextResponse.next();

  const url = new URL(req.url);
  const route = url.pathname;
  const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const key = `${route}:${ip}`;
  const now = Date.now();
  const rec = devCounts.get(key);
  if (!rec || now - rec.t > windowSec * 1000) {
    devCounts.set(key, { t: now, c: 1 });
    return NextResponse.next();
  }
  rec.c += 1;
  if (rec.c > max) {
    const r = NextResponse.json({ error: "rate_limited", message: "Too many requests. Try again shortly." }, { status: 429 });
    r.headers.set("Retry-After", String(windowSec));
    return r;
  }
  return NextResponse.next();
}
