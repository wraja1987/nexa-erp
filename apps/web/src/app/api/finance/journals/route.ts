import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const prisma = new PrismaClient()

const Line = z.object({ accountId: z.string().min(1), debit: z.coerce.number().default(0), credit: z.coerce.number().default(0) })
const CreateBody = z.object({ tenantId: z.string().min(1), docRef: z.string().optional(), memo: z.string().optional(), lines: z.array(Line).min(2) })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = CreateBody.parse(raw)
    const totalDebit = body.lines.reduce((s, l) => s + (l.debit || 0), 0)
    const totalCredit = body.lines.reduce((s, l) => s + (l.credit || 0), 0)
    if (Math.round((totalDebit - totalCredit) * 100) !== 0) {
      return NextResponse.json({ ok: false, code: 'unbalanced', message: 'Journal not balanced', ...corr }, { status: 400 })
    }
    const created = await prisma.journalEntry.create({ data: { tenantId: body.tenantId, docRef: body.docRef, memo: body.memo, lines: { create: body.lines.map(l => ({ accountId: l.accountId, debit: l.debit, credit: l.credit })) } } })
    audit({ route: '/api/finance/journals', module: 'finance', action: 'GL_JOURNAL_POST', status: 'ok', entryId: created.id })
    return NextResponse.json({ ok: true, entryId: created.id, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/journals', module: 'finance', action: 'GL_JOURNAL_POST', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


