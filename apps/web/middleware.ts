import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export const config = { matcher: ["/api/auth/signin", "/api/auth/callback/:path*", "/api/kpi/:path*", "/api/:path*"] };

const windowSec = Number(process.env.RATE_LIMIT_WINDOW_SEC || 60);
const max = Number(process.env.RATE_LIMIT_MAX || 100);

// Edge runtime: use a module-level Map for coarse burst control per route+ip.
const mem = new Map<string, { t: number; c: number }>();

export function middleware(req: NextRequest) {
  // To enforce a 503 during a window, uncomment and redeploy:
  // if (process.env.MAINTENANCE_MODE === "true") {
  //   const url = new URL(req.url);
  //   const exempt = ["/maintenance.json", "/api/admin/maintenance", "/website/status"];
  //   if (!exempt.some((p) => url.pathname.startsWith(p))) {
  //     return NextResponse.rewrite(new URL("/503", req.url), { status: 503 });
  //   }
  // }
  return NextResponse.next();
}
