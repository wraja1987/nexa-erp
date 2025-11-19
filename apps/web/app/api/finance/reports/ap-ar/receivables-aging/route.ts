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

    const invs = await prisma.customerInvoice.findMany({
      where: { tenantId },
      select: { id: true, number: true, currency: true, total: true, issuedAt: true, dueAt: true },
    });
    const pays = await prisma.customerPayment.groupBy({
      by: ["invoiceId"],
      where: { tenantId },
      _sum: { amount: true },
    });
    const paidMap = new Map(pays.map((p: any) => [p.invoiceId, Number(p._sum.amount || 0)]));
    const items: any[] = [];
    for (const inv of invs) {
      const total = Number(inv.total || 0);
      const paid = paidMap.get(inv.id) || 0;
      const balance = Math.max(0, total - paid);
      if (balance <= 0) continue;
      const due = inv.dueAt ? new Date(inv.dueAt as any) : new Date(inv.issuedAt as any);
      const days = Math.floor((asOf.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ id: inv.id, number: inv.number, currency: inv.currency, total, paid, balance, due: due.toISOString(), days, bucket: bucket(days) });
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


