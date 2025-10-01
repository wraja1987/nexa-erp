import { NextResponse } from 'next/server';
import nextAuthMiddleware from 'next-auth/middleware';

export default function middleware(req: Request) {
  if (process.env.LOCAL_LH === '1') {
    return NextResponse.next();
  }
  // Delegate to NextAuth middleware normally
  // @ts-ignore - nextAuthMiddleware has compatible signature
  return nextAuthMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api/health|api/kpi|api/modules|api/cache/revalidate|e2e|_next|favicon\\.ico).*)",
  ],
};


