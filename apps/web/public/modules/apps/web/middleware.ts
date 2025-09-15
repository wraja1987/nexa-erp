import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  'https://nexaai.co.uk',
  'https://www.nexaai.co.uk',
]);

const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = req.headers.get('origin') || '';
  const matchedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';

  // Handle preflight early
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    if (matchedOrigin) {
      res.headers.set('Access-Control-Allow-Origin', matchedOrigin);
    }
    res.headers.set('Vary', 'Origin');
    res.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
    res.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
    res.headers.set('Access-Control-Max-Age', '600');
    return res;
  }

  const res = NextResponse.next();
  if (matchedOrigin) {
    res.headers.set('Access-Control-Allow-Origin', matchedOrigin);
  }
  res.headers.set('Vary', 'Origin');
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};

