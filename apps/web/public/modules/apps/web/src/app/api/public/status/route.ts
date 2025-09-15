import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true, service: 'nexa-web', status: 'healthy' });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

