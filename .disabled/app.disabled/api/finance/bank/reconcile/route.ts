import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const RecoBody = z.object({ tenantId: z.string().min(1), bankAccountId: z.string().min(1), fromDate: z.coerce.date(), toDate: z.coerce.date(), statementBal: z.coerce.number() })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = RecoBody.parse(raw)
    const item = await prisma.bankReconciliation.create({ data: body })
    // mark included lines as reconciled
    await prisma.bankStatementLine.updateMany({ where: { tenantId: body.tenantId, bankAccountId: body.bankAccountId, date: { gte: body.fromDate, lte: body.toDate } }, data: { reconciled: true } })
    audit({ route: '/api/finance/bank/reconcile', module: 'finance', action: 'BANK_RECO', status: 'ok', id: item.id })
    return NextResponse.json({ ok: true, id: item.id, ...corr }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/bank/reconcile', module: 'finance', action: 'BANK_RECO', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}






