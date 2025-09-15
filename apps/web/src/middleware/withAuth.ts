import { NextResponse, NextRequest } from "next/server";

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>|NextResponse) {
  return async (req: NextRequest) => {
    // TODO: attach real session via headers/cookies (placeholder)
    req.headers.set("x-nexa-role", "superadmin");
    req.headers.set("x-nexa-tenant", "t-demo");
    return handler(req);
  };
}
