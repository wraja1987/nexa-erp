import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { convertAmount } from '../../../../../server/currency/convert'

const schema = z.object({ tenantId: z.string(), accountId: z.string(), balance: z.number(), from: z.string(), to: z.string() })

export async function POST(req: NextRequest) {
  try {
    const b = schema.parse(await req.json())
    const converted = await convertAmount(b.balance, b.from, b.to)
    const diff = converted - b.balance
    // Optionally post to GL if non-zero diff: use generic unrealized gain/loss accounts from headers
    const debit = (req.headers.get('x-gl-debit') || '').trim()
    const credit = (req.headers.get('x-gl-credit') || '').trim()
    if (Math.abs(diff) > 0.0001 && debit && credit) {
      const entry = await prisma.journalEntry.create({ data: { tenantId: b.tenantId, docRef: 'FX-REV', memo: `FX revaluation ${b.from}->${b.to}` } as any })
      if (diff > 0) {
        await prisma.journalLine.create({ data: { entryId: entry.id, accountId: debit, debit: diff as any, credit: 0 as any } })
        await prisma.journalLine.create({ data: { entryId: entry.id, accountId: credit, debit: 0 as any, credit: diff as any } })
      } else {
        const amt = Math.abs(diff)
        await prisma.journalLine.create({ data: { entryId: entry.id, accountId: debit, debit: 0 as any, credit: amt as any } })
        await prisma.journalLine.create({ data: { entryId: entry.id, accountId: credit, debit: amt as any, credit: 0 as any } })
      }
    }
    return Response.json({ ok:true, converted, diff })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status: 400 })
  }
}


