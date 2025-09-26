import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export async function GET() {
  const res = NextResponse.json({ ok: true, service: 'nexa-portal', ts: Date.now() });
  // triple-enforce uncached API
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('CDN-Cache-Control', 'no-store');
  res.headers.set('Surrogate-Control', 'no-store');
  return res;
}
