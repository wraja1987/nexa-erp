import { NextResponse } from 'next/server';
export function GET() { return NextResponse.json({ error: 'Not Found' }, { status: 404 }); }
export function HEAD() { return new Response(null, { status: 404 }); }
