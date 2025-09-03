import { NextResponse } from 'next/server'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

export async function GET(req?: Request) {
  const corr = withCorrelation()
  try {
    const role = req ? getRoleFromRequest(req) : 'user'
    const guard = ensureRoleAllowed('billing', role)
    if (!('ok' in guard) || guard.ok === false) {
      return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden', ...corr }, { status: 403 })
    }
    const configured = Boolean(process.env.STRIPE_WEBHOOK_SECRET)
    audit({ route: '/api/billing/webhook/status', configured })
    return NextResponse.json({ ok: true, configured, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/billing/webhook/status', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


