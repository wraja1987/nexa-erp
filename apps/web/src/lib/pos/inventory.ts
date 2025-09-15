import { prisma } from '../db'

export async function postSaleToGlAndInventory(options: { saleId: string; tenantId: string }): Promise<{ ok: true }> {
  const enabled = process.env.POS_POSTING_ENABLED === 'true'
  if (!enabled) return { ok: true }
  const sale = await prisma.posSale.findUnique({ where: { id: options.saleId }, include: { lines: true } })
  if (!sale) return { ok: true }
  // Decrement inventory via FIFO lots where available, else fallback to InventoryItem
  for (const l of sale.lines) {
    let remaining = Number(l.qty)
    const lots = await prisma.inventoryLot.findMany({
      where: { tenantId: options.tenantId, sku: l.sku, qty: { gt: 0 as any } },
      orderBy: { receivedAt: 'asc' },
    })
    for (const lot of lots) {
      if (remaining <= 0) break
      const take = Math.min(remaining, Number(lot.qty))
      remaining -= take
      await prisma.inventoryLot.update({ where: { id: lot.id }, data: { qty: (Number(lot.qty) - take) as any } })
    }
    if (remaining > 0) {
      await prisma.inventoryItem.updateMany({
        where: { tenantId: options.tenantId, sku: l.sku },
        data: { qtyOnHand: { decrement: remaining } as any },
      })
    }
  }
  // Post simple GL entries placeholder
  await prisma.journalEntry.create({
    data: {
      tenantId: options.tenantId,
      memo: `POS sale ${sale.saleNumber}`,
      lines: {
        create: [
          { account: { connect: { id: (await getAccountId(options.tenantId, 'Stripe Clearing')).id } }, debit: sale.total, credit: 0 },
          { account: { connect: { id: (await getAccountId(options.tenantId, 'Sales')).id } }, credit: sale.subtotal, debit: 0 },
          { account: { connect: { id: (await getAccountId(options.tenantId, 'VAT Liability')).id } }, credit: sale.tax, debit: 0 },
        ],
      },
    },
  })
  return { ok: true }
}

async function getAccountId(tenantId: string, name: string): Promise<{ id: string }> {
  const acc = await prisma.account.findFirst({ where: { tenantId, name } })
  if (acc) return { id: acc.id }
  const created = await prisma.account.create({ data: { tenantId, code: name.toUpperCase().replace(/\s+/g, '_').slice(0, 12), name, type: 'income' } })
  return { id: created.id }
}

export async function reverseSaleFromGlAndInventory(options: { saleId: string; tenantId: string }): Promise<{ ok: true }> {
  const enabled = process.env.POS_POSTING_ENABLED === 'true'
  if (!enabled) return { ok: true }
  const sale = await prisma.posSale.findUnique({ where: { id: options.saleId }, include: { lines: true } })
  if (!sale) return { ok: true }
  // Increment inventory back (add to most recent lot or fallback to InventoryItem)
  for (const l of sale.lines) {
    const latest = await prisma.inventoryLot.findFirst({ where: { tenantId: options.tenantId, sku: l.sku }, orderBy: { receivedAt: 'desc' } })
    if (latest) {
      await prisma.inventoryLot.update({ where: { id: latest.id }, data: { qty: (Number(latest.qty) + Number(l.qty)) as any } })
    } else {
      await prisma.inventoryItem.updateMany({ where: { tenantId: options.tenantId, sku: l.sku }, data: { qtyOnHand: { increment: Number(l.qty) } as any } })
    }
  }
  // Reverse GL entries placeholder
  await prisma.journalEntry.create({
    data: {
      tenantId: options.tenantId,
      memo: `POS refund ${sale.saleNumber}`,
      lines: {
        create: [
          { account: { connect: { id: (await getAccountId(options.tenantId, 'Stripe Clearing')).id } }, credit: sale.total, debit: 0 },
          { account: { connect: { id: (await getAccountId(options.tenantId, 'Sales')).id } }, debit: sale.subtotal, credit: 0 },
          { account: { connect: { id: (await getAccountId(options.tenantId, 'VAT Liability')).id } }, debit: sale.tax, credit: 0 },
        ],
      },
    },
  })
  return { ok: true }
}
