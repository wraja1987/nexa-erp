import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { prisma } from "@/lib/prisma";

function bucket(days: number) {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const entityId = searchParams.get("entityId") || null;
    const asOf = searchParams.get("asOf") ? new Date(String(searchParams.get("asOf"))) : new Date();
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    await assertLegalEntityAccess(entityId);

    const bills = await prisma.supplierBill.findMany({
      where: { tenantId },
      select: { id: true, number: true, currency: true, total: true, receivedAt: true, dueAt: true },
    });
    const pays = await prisma.supplierPayment.groupBy({
      by: ["billId"],
      where: { tenantId },
      _sum: { amount: true },
    });
    const paidMap = new Map(pays.map((p: any) => [p.billId, Number(p._sum.amount || 0)]));
    const items: any[] = [];
    for (const b of bills) {
      const total = Number(b.total || 0);
      const paid = paidMap.get(b.id) || 0;
      const balance = Math.max(0, total - paid);
      if (balance <= 0) continue;
      const due = b.dueAt ? new Date(b.dueAt as any) : new Date(b.receivedAt as any);
      const days = Math.floor((asOf.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ id: b.id, number: b.number, currency: b.currency, total, paid, balance, due: due.toISOString(), days, bucket: bucket(days) });
    }
    const totals = items.reduce((acc, r) => {
      const b = r.bucket as string;
      acc[b] = (acc[b] || 0) + r.balance;
      acc.all = (acc.all || 0) + r.balance;
      return acc;
    }, {} as Record<string, number>);
    return Response.json({ ok: true, scope: { tenantId, entityId, asOf: asOf.toISOString() }, totals, items });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


