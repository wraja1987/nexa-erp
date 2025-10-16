export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const ids = (authOptions.providers || []).map((p: any) => p?.id).filter(Boolean);
  return NextResponse.json({
    ok: true,
    configuredProviders: ids,
    env: {
      email: !!(process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST),
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      azure_ad: !!(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID),
      nextauth_url: !!process.env.NEXTAUTH_URL,
      trust_host: process.env.AUTH_TRUST_HOST === "true" || process.env.NEXTAUTH_TRUST_HOST === "true",
    },
  });
}


