import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const consentId = url.searchParams.get('consent') || 'sandbox-consent'
  await prisma.bankConnection.upsert({
    where: { id: 'sandbox-truelayer' },
    update: { status: 'active', consentId },
    create: { id: 'sandbox-truelayer', provider: 'truelayer', status: 'active', consentId },
  })
  audit({ route: '/api/open-banking/callback', ip: '0.0.0.0', session: 'ob' })
  return NextResponse.json({ ok: true, status: 'active' })
}


