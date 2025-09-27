import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000'}/api/modules?tree=1`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
