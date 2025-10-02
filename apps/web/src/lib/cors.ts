import { NextRequest, NextResponse } from "next/server";

// Exact allow-list (edit as needed)
const ALLOW = new Set<string>(["https://app.nexaai.co.uk","https://api.nexaai.co.uk"]);

export function originAllowed(origin: string | null) {
  return !!origin && ALLOW.has(origin);
}

export function withCors(req: NextRequest, res: NextResponse = NextResponse.next()) {
  const origin = req.headers.get("origin") ?? "";
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === "OPTIONS") {
    if (originAllowed(origin)) {
      const pre = new NextResponse(null, { status: 204 });
      pre.headers.set("Access-Control-Allow-Origin", origin);
      pre.headers.set("Vary", "Origin");
      pre.headers.set("Access-Control-Allow-Credentials", "true");
      pre.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
      pre.headers.set("Access-Control-Allow-Headers", req.headers.get("access-control-request-headers") ?? "Content-Type, Authorization, X-Requested-With");
      pre.headers.set("Access-Control-Max-Age", "600");
      return pre;
    }
    return new NextResponse("Blocked by CORS policy", { status: 403 });
  }

  // Simple requests
  if (originAllowed(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}
