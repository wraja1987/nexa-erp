import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json(
    { ok: true, service: 'nexa-portal', ts: Date.now() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

