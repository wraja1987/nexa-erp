// Auto-generated middleware: API-only CORS allow-list (APP_CORS_ORIGINS)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/api")) {
    const res = NextResponse.next();
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
    return res;
  }
  return NextResponse.next();
}
export const config = { matcher: ["/api/:path*"] };
