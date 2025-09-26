import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const ImportBody = z.object({ tenantId: z.string().min(1), bankAccountId: z.string().min(1), lines: z.array(z.object({ date: z.coerce.date(), description: z.string(), amount: z.coerce.number(), reference: z.string().optional() })) })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = ImportBody.parse(raw)
    const created = await prisma.$transaction(body.lines.map(l => prisma.bankStatementLine.create({ data: { tenantId: body.tenantId, bankAccountId: body.bankAccountId, date: l.date, description: l.description, amount: l.amount, reference: l.reference } })))
    audit({ route: '/api/finance/bank/import', module: 'finance', action: 'BANK_IMPORT', status: 'ok', count: created.length })
    return NextResponse.json({ ok: true, imported: created.length, ...corr }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/bank/import', module: 'finance', action: 'BANK_IMPORT', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}






