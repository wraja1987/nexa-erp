import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  tenantId: z.string().min(1),
  scheduleId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
})

export async function GET() {
  const rows = await prisma.payrollRun.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
  audit({ route: '/api/payroll/runs', action: 'list' })
  return NextResponse.json({ ok: true, status: 'active', data: rows })
}

export async function POST(req: Request) {
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('payroll', role)
    if (!guard.ok) return NextResponse.json({ ok: false, status: 'access_denied' }, { status: 403 })
    const data = CreateSchema.parse(await req.json())
    const created = await prisma.payrollRun.create({ data })
    audit({ route: '/api/payroll/runs', action: 'create' })
    return NextResponse.json({ ok: true, status: 'created', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


