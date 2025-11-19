import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listPickableOrders(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Safe subset: expose queued PickTasks as "pickable"
  return prisma.pickTask.findMany({
    where: { status: "queued", wave: { tenantId: scope.tenantId } },
    include: { wave: true, fromLoc: true, toLoc: true },
    orderBy: { createdAt: "asc" } as any,
  } as any);
}

export async function startPick() {
  // Not supported safely without reservations; document gap
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}

export async function completePick(
  scope: { tenantId: string; entityId?: string | null },
  pickTaskId: string,
  qtyPicked: number,
  actorId: string
) {
  // Phase 5A: Use new WMS pick service
  const { completePickTask } = await import("@/server/wms/pick-ship");
  return completePickTask(scope, pickTaskId, qtyPicked, actorId);
}

export async function startPack() {
  // Pack functionality not in scope for v1 - use pick/ship directly
  throw Object.assign(new Error("Pack functionality not implemented in v1. Use pick/ship flows directly."), { code: 501 });
}

export async function completePack() {
  // Pack functionality not in scope for v1 - use pick/ship directly
  throw Object.assign(new Error("Pack functionality not implemented in v1. Use pick/ship flows directly."), { code: 501 });
}

export async function confirmShipment(
  scope: { tenantId: string; entityId?: string | null },
  shipmentNumber: string,
  orderId: string,
  orderType: string,
  warehouseId: string,
  lines: Array<{ sku: string; qty: number }>,
  carrier?: string,
  tracking?: string,
  actorId: string
) {
  // Phase 5A: Use new WMS shipment service
  const { confirmShipment: confirmShipmentService } = await import("@/server/wms/pick-ship");
  return confirmShipmentService(scope, shipmentNumber, orderId, orderType, warehouseId, lines, carrier, tracking, actorId);
}


