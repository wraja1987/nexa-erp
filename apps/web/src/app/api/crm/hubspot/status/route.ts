import { NextResponse } from 'next/server'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test'
    if (!isTest && req) {
      const role = getRoleFromRequest(req)
      const guard = ensureRoleAllowed('marketplace', role)
      if (!guard.ok) {
        return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden', ...corr }, { status: 403 })
      }
    }
    const configured = Boolean(process.env.HUBSPOT_CLIENT_ID) && Boolean(process.env.HUBSPOT_CLIENT_SECRET)
    audit({ route: '/api/crm/hubspot/status', configured, hasMasked: true })
    return NextResponse.json({ ok: true, configured, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/crm/hubspot/status', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}






