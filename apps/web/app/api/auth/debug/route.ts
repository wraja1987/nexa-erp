import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    url: req.url,
    headers: Object.fromEntries(req.headers),
    cookies: req.cookies.getAll(),
  });
}
