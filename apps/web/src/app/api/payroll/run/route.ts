import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
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
    const body = Body.parse(await req.json())
    const { runId } = await runPayrollJob(body)
    audit({ route: '/api/payroll/run', action: 'create', runId })
    return NextResponse.json({ ok: true, runId, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/payroll/run', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


