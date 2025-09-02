import { NextResponse } from 'next/server'
import { audit } from '../../../../../lib/log/mask'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const vrn = process.env.HMRC_VRN
  audit({ route: '/api/hmrc/vat/returns', ip: '0.0.0.0', session: 'hmrc' })
  if (!vrn) return NextResponse.json({ ok: false, status: 'not_configured' }, { status: 200 })
  const rows = await prisma.vatReturn.findMany({ where: { vrn }, orderBy: { start: 'desc' } })
  return NextResponse.json({ ok: true, status: 'active', data: rows })
}


