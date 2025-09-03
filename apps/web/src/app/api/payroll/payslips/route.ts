import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { audit } from '../../../../lib/log/mask'
import { withCorrelation } from '../../../../lib/logger'

const prisma = new PrismaClient()

const Query = z.object({ runId: z.string().min(1) })

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('payroll', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const runId = searchParams.get('runId')
    const { runId: rid } = Query.parse({ runId })
    const slips = await prisma.payslip.findMany({ where: { runId: rid }, orderBy: { createdAt: 'asc' } })
    audit({ route: '/api/payroll/payslips', action: 'list', runId: rid, count: slips.length })
    return NextResponse.json({ ok: true, payslips: slips, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/payroll/payslips', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


