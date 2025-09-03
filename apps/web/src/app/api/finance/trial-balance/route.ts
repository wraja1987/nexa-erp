import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { audit } from '../../../../lib/log/mask'
import { withCorrelation } from '../../../../lib/logger'

const prisma = new PrismaClient()

const Query = z.object({ tenantId: z.string().min(1) })

export async function GET(req: Request) {
  const corr = withCorrelation()
  const url = new URL(req.url)
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const tenantId = url.searchParams.get('tenantId') || 't1'
    Query.parse({ tenantId })
    const lines = await prisma.journalLine.findMany({
      where: { entry: { tenantId } },
      select: { accountId: true, debit: true, credit: true, account: { select: { code: true, name: true, type: true } } },
    })
    const byAcct = new Map<string, { code: string; name: string; type: string; debit: number; credit: number }>()
    for (const l of lines) {
      const key = l.account?.code || l.accountId
      const acc = byAcct.get(key) || { code: l.account?.code || key, name: l.account?.name || key, type: l.account?.type || 'unknown', debit: 0, credit: 0 }
      acc.debit += Number(l.debit || 0)
      acc.credit += Number(l.credit || 0)
      byAcct.set(key, acc)
    }
    const rows = Array.from(byAcct.values()).map(r => ({ ...r, balance: Number((r.debit - r.credit).toFixed(2)) }))
    const totals = rows.reduce((s, r) => ({ debit: s.debit + r.debit, credit: s.credit + r.credit }), { debit: 0, credit: 0 })
    audit({ route: '/api/finance/trial-balance', module: 'finance', action: 'GL_TRIAL_BALANCE', status: 'ok', tenantId })
    return NextResponse.json({ ok: true, rows, totals, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/trial-balance', module: 'finance', action: 'GL_TRIAL_BALANCE', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


