// Auto-generated middleware: API-only CORS allow-list (APP_CORS_ORIGINS)
import type { NextRequest } from 'next/server';

// (no-op, or whatever logic you already run for app routes)
export function middleware(_req: NextRequest) {
  return;
}

export const config = {
  matcher: [
    // Exclude API routes, Next.js internals, and common static assets
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts/.*|images/.*|.*\\.(?:css|js|json|ico|png|jpg|jpeg|svg|webp|woff2?)$).*)',
  ],
};
