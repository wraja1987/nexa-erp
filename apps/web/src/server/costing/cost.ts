import { prisma } from '../../lib/db'

export async function applyFifoCost(tenantId: string, sku: string, issueQty: number) {
  let remaining = issueQty
  let totalCost = 0
  const lots = await prisma.inventoryLot.findMany({ where: { tenantId, sku }, orderBy: { receivedAt: 'asc' } })
  for (const lot of lots) {
    if (remaining <= 0) break
    const take = Math.min(Number(lot.qty), remaining)
    totalCost += take * Number(lot.unitCost)
    remaining -= take
    await prisma.inventoryLot.update({ where: { id: lot.id }, data: { qty: (Number(lot.qty) - take) as any } })
  }
  if (remaining > 0) throw new Error('Insufficient inventory for FIFO issue')
  return totalCost
}

export async function averageCost(tenantId: string, sku: string) {
  const lots = await prisma.inventoryLot.findMany({ where: { tenantId, sku } })
  const qty = lots.reduce((s, l) => s + Number(l.qty), 0)
  const value = lots.reduce((s, l) => s + Number(l.qty) * Number(l.unitCost), 0)
  return qty === 0 ? 0 : value / qty
}






