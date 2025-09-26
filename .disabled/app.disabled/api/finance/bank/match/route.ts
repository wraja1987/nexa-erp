import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'

const schema = z.object({ tenantId: z.string(), bankAccountId: z.string(), limit: z.number().default(20) })

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 't1'
    const bankAccountId = req.nextUrl.searchParams.get('bankAccountId') || ''
    const limit = Number(req.nextUrl.searchParams.get('limit') || '20')
    if (!bankAccountId) return Response.json({ ok:false, code:400, message:'Missing bankAccountId' }, { status:400 })
    const lines = await prisma.bankStatementLine.findMany({ where: { tenantId, bankAccountId, reconciled: false }, take: limit })
    // Heuristic: match to customer/supplier payments by reference
    const suggestions = [] as any[]
    for (const l of lines) {
      const ref = l.reference || l.description
      const cp = await prisma.customerPayment.findFirst({ where: { tenantId, reference: ref } })
      if (cp) { suggestions.push({ lineId: l.id, type: 'AR', ref, paymentId: cp.id, amount: cp.amount }) ; continue }
      const sp = await prisma.supplierPayment.findFirst({ where: { tenantId, reference: ref } })
      if (sp) { suggestions.push({ lineId: l.id, type: 'AP', ref, paymentId: sp.id, amount: sp.amount }) ; continue }
    }
    return Response.json({ ok:true, suggestions })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status:400 })
  }
}




