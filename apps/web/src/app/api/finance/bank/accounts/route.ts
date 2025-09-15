import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const CreateBody = z.object({ tenantId: z.string().min(1), code: z.string().min(1), name: z.string().min(1), currency: z.string().default('GBP') })

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const url = new URL(req.url)
    const tenantId = url.searchParams.get('tenantId') || 't1'
    const items = await prisma.bankAccount.findMany({ where: { tenantId } })
    return NextResponse.json({ ok: true, items, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/bank/accounts', module: 'finance', action: 'BANK_LIST', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = CreateBody.parse(raw)
    const item = await prisma.bankAccount.create({ data: body })
    audit({ route: '/api/finance/bank/accounts', module: 'finance', action: 'BANK_CREATE', status: 'ok', code: item.code })
    return NextResponse.json({ ok: true, item, ...corr }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/bank/accounts', module: 'finance', action: 'BANK_CREATE', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}






