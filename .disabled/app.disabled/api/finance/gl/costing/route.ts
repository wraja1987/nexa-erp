import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'

const bodySchema = z.object({
  tenantId: z.string(),
  docRef: z.string().optional(),
  memo: z.string().optional(),
  debitAccountId: z.string(),
  creditAccountId: z.string(),
  amount: z.number().positive(),
})

export async function POST(req: NextRequest) {
  try {
    const b = bodySchema.parse(await req.json())
    const entry = await prisma.journalEntry.create({ data: { tenantId: b.tenantId, docRef: b.docRef, memo: b.memo } as any })
    await prisma.journalLine.create({ data: { entryId: entry.id, accountId: b.debitAccountId, debit: b.amount as any, credit: 0 as any } })
    await prisma.journalLine.create({ data: { entryId: entry.id, accountId: b.creditAccountId, debit: 0 as any, credit: b.amount as any } })
    return Response.json({ ok: true, entryId: entry.id })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status: 400 })
  }
}






