export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function GET() {
  const host = !!process.env.SMTP_HOST;
  const port = !!process.env.SMTP_PORT;
  const user = !!process.env.SMTP_USER;
  const pass = !!process.env.SMTP_PASS;
  const from = !!process.env.EMAIL_FROM;
  const fromOk = !!(process.env.EMAIL_FROM && /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(process.env.EMAIL_FROM!));
  const ok = host && port && user && pass && from && fromOk;

  return NextResponse.json({
    ok, fromOk, host, port, user, pass, from,
    note: "All true & fromOk=true => Email provider will initialise."
  });
}


