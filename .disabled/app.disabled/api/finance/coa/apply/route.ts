import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const ApplyBody = z.object({ tenantId: z.string().min(1), templateCode: z.string().min(1) })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = ApplyBody.parse(raw)
    const tpl = await prisma.coaTemplate.findUnique({ where: { code: body.templateCode }, include: { lines: true } })
    if (!tpl) return NextResponse.json({ ok: false, code: 'not_found', message: 'Template not found', ...corr }, { status: 404 })
    await prisma.$transaction(
      tpl.lines.map(l => prisma.account.upsert({
        where: { tenantId_code: { tenantId: body.tenantId, code: l.code } },
        update: { name: l.name, type: l.type },
        create: { tenantId: body.tenantId, code: l.code, name: l.name, type: l.type },
      }))
    )
    audit({ route: '/api/finance/coa/apply', module: 'finance', action: 'COA_APPLY', status: 'ok', template: tpl.code })
    return NextResponse.json({ ok: true, applied: tpl.lines.length, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/coa/apply', module: 'finance', action: 'COA_APPLY', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}






