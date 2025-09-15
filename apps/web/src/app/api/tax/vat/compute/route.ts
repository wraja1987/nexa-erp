import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'

const schema = z.object({ tenantId: z.string(), start: z.string().transform(s=>new Date(s)), end: z.string().transform(s=>new Date(s)) })

export async function POST(req: NextRequest) {
  try {
    const b = schema.parse(await req.json())
    // Compute VAT boxes from GL journal lines: assume VAT accounts contain 'VAT' in account name
    const lines = await prisma.journalLine.findMany({
      where: { entry: { tenantId: b.tenantId, postedAt: { gte: b.start, lte: b.end } } },
      include: { account: true, entry: true } as any
    } as any)
    const vatLines = lines.filter((l: any) => (l.account?.name || '').toUpperCase().includes('VAT'))
    const vatDueSales = vatLines.reduce((s: number, l: any) => s + Number(l.credit || 0) - Number(l.debit || 0), 0)
    const vatDueAcquisitions = 0
    const totalVatDue = vatDueSales + vatDueAcquisitions
    const netVatDue = totalVatDue
    return Response.json({ ok:true, vatDueSales, vatDueAcquisitions, totalVatDue, netVatDue, boxSix: 0, boxSeven: 0, boxEight: 0, boxNine: 0 })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status: 400 })
  }
}


