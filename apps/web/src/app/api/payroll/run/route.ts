import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest, ensurePermissionAllowed, getActorIdFromRequest } from '../../../../lib/rbac'
import { audit } from '../../../../lib/log/mask'
import { withCorrelation } from '../../../../lib/logger'
import { runPayrollJob } from '../../../../jobs/payroll/run'

const Body = z.object({
  tenantId: z.string().min(1),
  scheduleId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
})

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('payroll', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const perm = ensurePermissionAllowed('payroll:run', role)
    if (!perm.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden' }, { status: 403 })
    // Accept JSON or accidental text payloads
    let raw: any
    try {
      const c = req.clone()
      raw = await c.json()
    } catch {
      const txt = await req.text()
      raw = JSON.parse(txt)
    }
    const body = Body.parse(raw)
    const t0 = Date.now()
    const { runId } = await runPayrollJob(body)
    const durationMs = Date.now() - t0
    audit({ route: '/api/payroll/run', module: 'payroll', action: 'PAYROLL_RUN', status: 'ok', durationMs, actorId: getActorIdFromRequest(req), runId })
    return NextResponse.json({ ok: true, runId, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/payroll/run', module: 'payroll', action: 'PAYROLL_RUN', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


