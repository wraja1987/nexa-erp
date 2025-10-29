import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public') ||
    PUBLIC_FILE.test(pathname);

  if (isPublic) {
    console.log('[mw] allow', pathname);
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    console.log('[mw] allow', pathname, 'user', token?.sub);
    return NextResponse.next();
  }

  const cb = encodeURIComponent(`${pathname}${search || ''}`);
  const url = new URL(`/login?callbackUrl=${cb}`, req.url);
  console.log('[mw] redirect', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next|api/auth|icons|images|favicon.ico).*)',
  ],
};
