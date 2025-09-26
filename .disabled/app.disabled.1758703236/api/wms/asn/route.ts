import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  number: z.string().min(3),
  tenantId: z.string().min(1),
  supplierRef: z.string().optional(),
  eta: z.coerce.date().optional(),
})

export async function GET() {
  const rows = await prisma.asn.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  audit({ route: '/api/wms/asn', action: 'list' })
  return NextResponse.json({ ok: true, status: 'active', data: rows })
}

export async function POST(req: Request) {
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('wms', role)
    if (!guard.ok) return NextResponse.json({ ok: false, status: 'access_denied' }, { status: 403 })
    const body = await req.json()
    const parsed = CreateSchema.parse(body)
    const created = await prisma.asn.create({ data: parsed })
    audit({ route: '/api/wms/asn', action: 'create' })
    return NextResponse.json({ ok: true, status: 'created', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


