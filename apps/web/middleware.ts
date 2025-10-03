import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "https://app.nexaai.co.uk",
  "https://api.nexaai.co.uk"
];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse("CORS blocked", { status: 403 });
  }

  const res = NextResponse.next();

  // Set CORS headers only for allowed origins
  if (allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
