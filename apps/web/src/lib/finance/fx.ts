import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "./entity";

export type FxRate = { fromCode: string; toCode: string; rate: number; asOfDate: Date };

export async function getFunctionalCurrencyForScope(entityId?: string | null): Promise<{ currency: string; mode: "entity" | "fallback" }> {
  const scope = await assertLegalEntityAccess(entityId || null);
  if (scope.entityId) {
    const ent = await prisma.entity.findUnique({ where: { id: scope.entityId }, select: { currencyCode: true } });
    if (ent?.currencyCode) return { currency: ent.currencyCode, mode: "entity" };
  }
  // Fallback when multi-entity/tenant-wide (proper multi-entity config is a schema gap)
  return { currency: "GBP", mode: "fallback" };
}

export async function getFxRate(fromCode: string, toCode: string, asOf: Date): Promise<number> {
  if (!fromCode || !toCode) throw new Error("invalid_currency");
  if (fromCode === toCode) return 1;
  const rec = await prisma.currencyRate.findFirst({
    where: { fromCode, toCode, asOfDate: { lte: asOf } },
    orderBy: { asOfDate: "desc" },
  });
  if (!rec) throw new Error(`fx_rate_not_found:${fromCode}->${toCode}`);
  return Number(rec.rate);
}

export async function convertToFunctional(amount: number, txCurrency: string, asOf: Date, entityId?: string | null) {
  const { currency: func } = await getFunctionalCurrencyForScope(entityId || null);
  const rate = await getFxRate(txCurrency, func, asOf);
  return { functionalCurrency: func, functionalAmount: amount * rate, rate };
}


