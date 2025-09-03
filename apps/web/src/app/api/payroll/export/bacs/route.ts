import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest, ensurePermissionAllowed, getActorIdFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'
import { toBacsCsv } from '../../../../../server/payroll/bacs'

const prisma = new PrismaClient()
const Query = z.object({ runId: z.string().min(1), processingDate: z.string().regex(/^\d{8}$/) })

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('payroll', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const perm = ensurePermissionAllowed('payroll:read', role)
    if (!perm.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const runId = searchParams.get('runId')
    const processingDate = searchParams.get('processingDate') || new Date().toISOString().slice(0,10).replace(/-/g,'')
    const { runId: rid, processingDate: yyyymmdd } = Query.parse({ runId, processingDate })
    const slips = await prisma.payslip.findMany({ where: { runId: rid } })
    const rows = slips.map((s) => ({
      DestinationSortCode: '000000',
      DestinationAccountNumber: '00000000',
      AmountPence: Number(s.netPay),
      DestinationName: 'EMP',
      Reference: `PAY-${rid.slice(0,6)}`,
      ProcessingDate: yyyymmdd,
    }))
    const csv = toBacsCsv(rows)
    audit({ route: '/api/payroll/export/bacs', module: 'payroll', action: 'PAYSLIP_EXPORT', status: 'ok', actorId: getActorIdFromRequest(req), runId: rid, rows: rows.length })
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bacs-${rid}.csv"`,
        'x-correlation-id': corr.correlationId,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/payroll/export/bacs', module: 'payroll', action: 'PAYSLIP_EXPORT', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


