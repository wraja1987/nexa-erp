import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/db'
import { applyFifoCost, averageCost } from '../../../../server/costing/cost'

const schema = z.object({
  tenantId: z.string(),
  sku: z.string(),
  qty: z.number(),
  type: z.enum(['receipt','issue']),
  costMethod: z.enum(['FIFO','WAV']).default('FIFO'),
  unitCost: z.number().optional(),
  glDebit: z.string().optional(),
  glCredit: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    if (body.type === 'receipt') {
      const uc = body.unitCost ?? 0
      await prisma.inventoryLot.create({ data: { tenantId: body.tenantId, sku: body.sku, qty: body.qty as any, unitCost: uc as any } })
      return Response.json({ ok: true })
    }
    // issue
    let cost = 0
    if (body.costMethod === 'FIFO') {
      cost = await applyFifoCost(body.tenantId, body.sku, body.qty)
    } else {
      const wav = await averageCost(body.tenantId, body.sku)
      cost = wav * body.qty
      // reduce quantity proportionally (simple approach: one aggregated lot)
      const lots = await prisma.inventoryLot.findMany({ where: { tenantId: body.tenantId, sku: body.sku }, orderBy: { receivedAt: 'asc' } })
      let remaining = body.qty
      for (const lot of lots) {
        if (remaining <= 0) break
        const take = Math.min(Number(lot.qty), remaining)
        remaining -= take
        await prisma.inventoryLot.update({ where: { id: lot.id }, data: { qty: (Number(lot.qty) - take) as any } })
      }
      if (remaining > 0) throw new Error('Insufficient inventory')
    }
    // Optional GL posting for COGS/WIP
    const { glDebit, glCredit } = body
    if (glDebit && glCredit) {
      // Ensure accounts exist (upsert by code)
      const debitAcc = await prisma.account.upsert({
        where: { tenantId_code: { tenantId: body.tenantId, code: glDebit } } as any,
        update: {},
        create: { tenantId: body.tenantId, code: glDebit, name: glDebit, type: 'expense' }
      } as any)
      const creditAcc = await prisma.account.upsert({
        where: { tenantId_code: { tenantId: body.tenantId, code: glCredit } } as any,
        update: {},
        create: { tenantId: body.tenantId, code: glCredit, name: glCredit, type: 'asset' }
      } as any)
      const entry = await prisma.journalEntry.create({ data: { tenantId: body.tenantId, docRef: `INV-${body.sku}`, memo: `${body.type} ${body.sku}` } as any })
      await prisma.journalLine.create({ data: { entryId: entry.id, accountId: debitAcc.id, debit: cost as any, credit: 0 as any } })
      await prisma.journalLine.create({ data: { entryId: entry.id, accountId: creditAcc.id, debit: 0 as any, credit: cost as any } })
    }
    return Response.json({ ok: true, cost })
  } catch (e: any) {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status: 400 })
  }
}


