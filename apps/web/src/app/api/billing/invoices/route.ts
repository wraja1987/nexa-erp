import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { audit } from '../../../../lib/log/mask'
import { withCorrelation } from '../../../../lib/logger'

const prisma = new PrismaClient()

const Query = z.object({ tenantId: z.string().optional(), limit: z.coerce.number().int().positive().max(100).default(20) })

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('billing', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const parsed = Query.parse({ tenantId: searchParams.get('tenantId') || undefined, limit: searchParams.get('limit') || undefined })
    const where = parsed.tenantId ? { tenantId: parsed.tenantId } : {}
    const rows = await prisma.invoice.findMany({ where, orderBy: { issuedAt: 'desc' }, take: parsed.limit })
    audit({ route: '/api/billing/invoices', action: 'list', count: rows.length })
    return NextResponse.json({ ok: true, invoices: rows, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/billing/invoices', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


