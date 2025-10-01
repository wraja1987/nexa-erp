import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = [/^\/_next\//, /^\/api\//, /^\/login$/, /^\/favicon\./, /^\/assets\//];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/modules')) {
    const has = req.cookies.has('next-auth.session-token') || req.cookies.has('__Secure-next-auth.session-token');
    if (!has) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|api|assets|favicon).*)'] };
