import { NextResponse } from 'next/server'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { withCorrelation } from '../../../../lib/logger'

const Body = z.object({
  sku: z.string().min(1),
  qty: z.coerce.number().int().positive().default(1),
})

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('wms', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const body = Body.parse(await req.json())
    const labels = Array.from({ length: body.qty }).map((_, i) => ({
      sku: body.sku,
      index: i + 1,
      barcode: `SKU-${body.sku}-${Date.now()}-${i + 1}`,
    }))
    audit({ route: '/api/wms/labels', action: 'generate', sku: body.sku, qty: body.qty })
    return NextResponse.json({ ok: true, labels, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/wms/labels', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


