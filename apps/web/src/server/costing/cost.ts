import { prisma } from '../../lib/db'

interface InventoryLotLike { qty: number | string; unitCost: number | string; id: string; }

export async function applyFifoCost(tenantId: string, sku: string, issueQty: number) {
  let remaining = issueQty
  let totalCost = 0
  const lots = await prisma.inventoryLot.findMany({ where: { tenantId, sku }, orderBy: { receivedAt: 'asc' } })
  for (const lot of lots as unknown as InventoryLotLike[]) {
    if (remaining <= 0) break
    const take = Math.min(Number((lot as any).qty), remaining)
    totalCost += take * Number((lot as any).unitCost)
    remaining -= take
    await prisma.inventoryLot.update({ where: { id: (lot as any).id }, data: { qty: (Number((lot as any).qty) - take) as any } })
  }
  if (remaining > 0) throw new Error('Insufficient inventory for FIFO issue')
  return totalCost
}

export async function averageCost(tenantId: string, sku: string) {
  const lots = await prisma.inventoryLot.findMany({ where: { tenantId, sku } })
  const qty = (lots as InventoryLotLike[]).reduce((sum: number, lot: InventoryLotLike) => sum + Number(lot.qty), 0)
  const value = (lots as InventoryLotLike[]).reduce((sum: number, lot: InventoryLotLike) => sum + Number(lot.qty) * Number(lot.unitCost), 0)
  return qty === 0 ? 0 : value / qty
}






