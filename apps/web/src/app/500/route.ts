import { NextResponse } from 'next/server';
export function GET(){ return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
export function HEAD(){ return new Response(null, { status: 500 }); }
