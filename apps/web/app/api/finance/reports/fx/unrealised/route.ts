import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { prisma } from "@/lib/prisma";
import { convertToFunctional } from "@/lib/finance/fx";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const entityId = searchParams.get("entityId") || null;
    const asOf = searchParams.get("asOf") ? new Date(String(searchParams.get("asOf"))) : new Date();
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    await assertLegalEntityAccess(entityId);

    // Read open documents (approximate) — schema does not include payment currency, so we report notional totals
    const invoices = await prisma.customerInvoice.findMany({
      where: { tenantId },
      select: { id: true, currency: true, total: true, issuedAt: true },
    });
    const bills = await prisma.supplierBill.findMany({
      where: { tenantId },
      select: { id: true, currency: true, total: true, receivedAt: true },
    });

    const items: Array<{ type: "AR" | "AP"; id: string; txCurrency: string; txTotal: number; asOf: string; functionalCurrency: string; functionalAmount: number; rate: number }> = [];

    for (const inv of invoices) {
      const conv = await convertToFunctional(Number(inv.total || 0), inv.currency || "GBP", asOf, entityId);
      items.push({
        type: "AR",
        id: inv.id,
        txCurrency: inv.currency || "GBP",
        txTotal: Number(inv.total || 0),
        asOf: asOf.toISOString(),
        functionalCurrency: conv.functionalCurrency,
        functionalAmount: conv.functionalAmount,
        rate: conv.rate,
      });
    }
    for (const b of bills) {
      const conv = await convertToFunctional(Number(b.total || 0), b.currency || "GBP", asOf, entityId);
      items.push({
        type: "AP",
        id: b.id,
        txCurrency: b.currency || "GBP",
        txTotal: Number(b.total || 0),
        asOf: asOf.toISOString(),
        functionalCurrency: conv.functionalCurrency,
        functionalAmount: conv.functionalAmount,
        rate: conv.rate,
      });
    }
    const totals = items.reduce(
      (acc, i) => {
        acc.functional += i.functionalAmount;
        return acc;
      },
      { functional: 0 }
    );
    const note =
      "Approximate tenant-level remeasurement (no deduction for settlements). Schema gap: missing payment currency prevents precise open-balance remeasurement.";
    return Response.json({ ok: true, scope: { tenantId, entityId, asOf: asOf.toISOString() }, items, totals, note });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


