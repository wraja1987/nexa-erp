import type { NextApiRequest, NextApiResponse } from 'next'
import { getProviders } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const providers = await getProviders()
    const check = await prisma.$queryRaw`SELECT 1 as ok` as any
    const dbOk = !!(Array.isArray(check) ? check[0]?.ok : (check as any)?.ok)
    let smtpOk = false
    try {
      const url = process.env.EMAIL_SERVER
      if (url) {
        const transport = nodemailer.createTransport(url)
        await transport.verify()
        smtpOk = true
      }
    } catch { smtpOk = false }
    const cookieFlags = { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax' }
    res.status(200).json({
      ok: true,
      providers: Object.keys(providers ?? {}),
      db: { ok: !!dbOk },
      smtp: { ok: smtpOk },
      cookies: cookieFlags,
      mfa: { requiredFor: ['super_admin','admin'] }
    })
  } catch (e: any) {
    res.status(500).json({ ok:false, error: e?.message ?? 'unknown' })
  }
}

// Tip: wrap handler with withSentry for richer traces
import { withSentry } from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mask = (s?: string | null) => {
    if (!s) return "";
    const head = s.slice(0, 6);
    const tail = s.slice(-6);
    return `${head}…${tail}`;
  };

  const id = process.env.GOOGLE_CLIENT_ID || "";
  const secret = process.env.GOOGLE_CLIENT_SECRET || "";
  const nextauthUrl = process.env.NEXTAUTH_URL || "";
  const trust = process.env.AUTH_TRUST_HOST || "";
  const debug = process.env.NEXTAUTH_DEBUG || "";

  res.status(200).json({
    GOOGLE_CLIENT_ID_present: Boolean(id),
    GOOGLE_CLIENT_ID_sample: mask(id),
    GOOGLE_CLIENT_SECRET_present: Boolean(secret),
    GOOGLE_CLIENT_SECRET_len: secret.length,
    NEXTAUTH_URL: nextauthUrl,
    AUTH_TRUST_HOST: trust,
    NEXTAUTH_DEBUG: debug,
    hint: "clientId/secret MUST be truthy; NEXTAUTH_URL must be http://localhost:3000 for local",
  });
}
