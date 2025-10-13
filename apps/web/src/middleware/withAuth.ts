import { NextResponse, NextRequest } from "next/server";

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>|NextResponse) {
  return async (req: NextRequest) => {
    // Attach a minimal session-like context via headers until full auth is wired.
    req.headers.set("x-nexa-role", "superadmin");
    req.headers.set("x-nexa-tenant", "t-demo");
    return handler(req);
  };
}
