import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listReceipts(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Safe subset: list ASNs (no lines)
  return prisma.asn.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getReceipt(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const asn = await prisma.asn.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!asn) throw Object.assign(new Error("not_found"), { code: 404 });
  return asn;
}

export async function receiveAgainstPO() {
  // Without receipt lines and stock movement ledger, do not fake inventory changes
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}


