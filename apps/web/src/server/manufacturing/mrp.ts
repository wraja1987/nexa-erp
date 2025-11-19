import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { calculateNetReqRows } from "@/lib/manufacturing/mrp";

export async function calculateNetRequirements(scope: { tenantId: string; entityId?: string | null }, params?: { horizonDays?: number }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const horizonDays = params?.horizonDays ?? 30;
  const horizonDate = new Date(Date.now() + horizonDays * 24 * 60 * 60 * 1000);
  // Demand source: planned work orders within horizon
  const demandWos = await prisma.workOrder.findMany({
    where: {
      tenantId: scope.tenantId,
      status: "planned" as any,
      OR: [{ endPlanned: null }, { endPlanned: { lte: horizonDate } }],
    },
  });
  const byItemDemand: Record<string, number> = {};
  for (const w of demandWos) byItemDemand[w.itemCode] = (byItemDemand[w.itemCode] || 0) + Number(w.quantity || 0);
  // On hand source: InventoryItem
  const items = await prisma.inventoryItem.findMany({ where: { tenantId: scope.tenantId } });
  const byItemOnHand: Record<string, number> = {};
  for (const i of items) byItemOnHand[i.sku] = (byItemOnHand[i.sku] || 0) + Number(i.qtyOnHand || 0);
  const allItems = new Set<string>([...Object.keys(byItemDemand), ...Object.keys(byItemOnHand)]);
  const rows = Array.from(allItems).map((itemCode) => ({
    itemCode,
    demandQtyMinor: byItemDemand[itemCode] || 0,
    onHandQtyMinor: byItemOnHand[itemCode] || 0,
  }));
  return calculateNetReqRows(rows);
}

export async function generatePlannedOrders(scope: { tenantId: string; entityId?: string | null }, params?: { horizonDays?: number }) {
  // Safe subset: compute suggestions only; do not persist to MrpPlan in this phase
  const net = await calculateNetRequirements(scope, params);
  const today = new Date();
  return net
    .filter((r) => r.netRequirement > 0)
    .map((r) => ({
      itemCode: r.itemCode,
      suggestedQtyMinor: r.netRequirement,
      dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // assume 2 weeks; doc limitation
      source: "WO", // suggestion to create Work Order
    }));
}


