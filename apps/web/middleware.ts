import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = { matcher: ['/((?!_next/).*)'] };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle API CORS preflight first
  if (pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set('Access-Control-Allow-Origin', 'https://www.nexaai.co.uk');
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.headers.set('Access-Control-Max-Age', '600');
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Vary', 'Origin');
    return res;
  }

  const res = NextResponse.next();

  // API responses: never cache + strict CORS
  if (pathname.startsWith('/api/')) {
    res.headers.delete('Cache-Control');
    res.headers.delete('CDN-Cache-Control');
    res.headers.delete('Surrogate-Control');
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Access-Control-Allow-Origin', 'https://www.nexaai.co.uk');
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.headers.set('Vary', 'Origin');
    return res;
  }

  // HTML/pages (exclude /_next via matcher): modern cache policy
  if (req.method === 'GET') {
    res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  }
  return res;
}
