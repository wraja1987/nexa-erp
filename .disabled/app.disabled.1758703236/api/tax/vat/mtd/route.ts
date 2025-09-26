import { NextResponse } from 'next/server'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    audit({ route: '/api/tax/vat/mtd', module: 'finance', action: 'VAT_STATUS', status: 'ok' })
    return NextResponse.json({ ok: true, connected: false, obligations: [], ...corr })
  } catch {
    return NextResponse.json({ ok: false, code: 'bad_request', message: 'Bad Request', ...corr }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    audit({ route: '/api/tax/vat/mtd', module: 'finance', action: 'VAT_SUBMIT', status: 'ok' })
    return NextResponse.json({ ok: true, submitted: true, ...corr }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, code: 'bad_request', message: 'Bad Request', ...corr }, { status: 400 })
  }
}






