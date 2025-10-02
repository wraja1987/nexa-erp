import { NextRequest, NextResponse } from "next/server";

const ALLOW = new Set<string>([
  process.env.NEXT_PUBLIC_APP_ORIGIN || "https://app.nexaai.co.uk",
  process.env.API_HOST || "https://api.nexaai.co.uk",
]);

export function withCors(req: NextRequest, res: NextResponse = NextResponse.next()) {
  const origin = req.headers.get("origin") ?? "";
  const method = req.method.toUpperCase();

  // Preflight
  if (method === "OPTIONS") {
    if (origin && ALLOW.has(origin)) {
      const pre = new NextResponse(null, { status: 204 });
      pre.headers.set("Access-Control-Allow-Origin", origin);
      pre.headers.set("Vary", "Origin");
      pre.headers.set("Access-Control-Allow-Credentials", "true");
      pre.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
      pre.headers.set(
        "Access-Control-Allow-Headers",
        req.headers.get("access-control-request-headers") ?? "Content-Type, Authorization, X-Requested-With"
      );
      pre.headers.set("Access-Control-Max-Age", "600");
      return pre;
    }
    return new NextResponse("Blocked by CORS policy", { status: 403 });
  }

  // Simple requests
  if (origin && ALLOW.has(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export function originAllowed(origin: string | null) {
  return !!origin && ALLOW.has(origin);
}
