import { prisma } from "@/lib/prisma";

export type CogsComputation = {
  sku: string;
  qtyMinor: number;
  costPerUnitMinor: number;
  totalCostMinor: number;
};

async function getWeightedAverageCost(tenantId: string, sku: string): Promise<number> {
  const lots = await prisma.inventoryLot.findMany({ where: { tenantId, sku } });
  if (!lots.length) return 0;
  let totalQty = 0;
  let totalCost = 0;
  for (const lot of lots) {
    totalQty += Number(lot.qty || 0);
    totalCost += Number(lot.qty || 0) * Number(lot.unitCost || 0);
  }
  if (totalQty <= 0) return 0;
  return Math.round(totalCost / totalQty);
}

export async function computeCogsForSkus(
  tenantId: string,
  items: { sku: string; qtyMinor: number }[]
): Promise<CogsComputation[]> {
  const out: CogsComputation[] = [];
  for (const it of items) {
    const cpu = await getWeightedAverageCost(tenantId, it.sku);
    out.push({ sku: it.sku, qtyMinor: it.qtyMinor, costPerUnitMinor: cpu, totalCostMinor: Math.round(cpu * it.qtyMinor) });
  }
  return out;
}


