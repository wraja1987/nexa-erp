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
