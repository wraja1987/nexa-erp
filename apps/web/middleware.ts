import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOW = new Set([
  'https://nexaai.co.uk',
  'https://www.nexaai.co.uk',
]);

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const origin = req.headers.get('origin') || '';
  const allowed = ALLOW.has(origin) ? origin : '';

  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    if (allowed) res.headers.set('Access-Control-Allow-Origin', allowed);
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.headers.set('Access-Control-Max-Age', '600');
    res.headers.set('Vary', 'Origin');
    return res;
  }

  const res = NextResponse.next();
  if (allowed) res.headers.set('Access-Control-Allow-Origin', allowed);
  res.headers.set('Vary', 'Origin');
  return res;
}
export const config = { matcher: ['/api/:path*'] };
