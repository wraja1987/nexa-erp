import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = {
    ok: true,
    now: new Date().toISOString(),
    nextauthUrl: process.env.NEXTAUTH_URL || null,
    env: {
      nodeEnv: process.env.NODE_ENV || null,
      hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
    },
    cookies: {
      sessionName: "__Secure-next-auth.session-token",
      domain: ".nexaai.co.uk",
      sameSite: "lax",
      secure: true,
    },
  };
  return NextResponse.json(body, { status: 200 });
}













