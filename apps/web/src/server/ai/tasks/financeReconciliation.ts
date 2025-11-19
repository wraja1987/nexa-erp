import { AI_ENGINE_ENABLED } from "@/server/ai/config";
import { NexaAiClient } from "@/server/ai/client";
import { FINANCE_RECONCILIATION_PROMPT_V1 } from "@/server/ai/prompts/finance";
import { listUnreconciledBankTransactions } from "@/server/banking/reconciliation";
import { prisma } from "@/lib/prisma";
import { stripPiiFromCustomer, stripPiiFromVendor, stripPiiFromGenericRecord } from "@/server/ai/pseudo";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function getReconciliationSuggestions(scope: { tenantId: string; entityId?: string | null }, params?: { limit?: number }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!AI_ENGINE_ENABLED) return { supported: false, message: "AI_ENGINE_DISABLED", suggestions: [] };
  try {
    const bankLines = await listUnreconciledBankTransactions(scope.tenantId);
    const invoices = await prisma.customerInvoice.findMany({ where: { tenantId: scope.tenantId }, take: params?.limit || 50 });
    const bills = await prisma.supplierBill.findMany({ where: { tenantId: scope.tenantId }, take: params?.limit || 50 });
    const payload = {
      bankLines: stripPiiFromGenericRecord(bankLines),
      arDocs: invoices.map((d) => stripPiiFromCustomer(d)),
      apDocs: bills.map((d) => stripPiiFromVendor(d)),
    };
    const prompt = `${FINANCE_RECONCILIATION_PROMPT_V1}\nData:\n${JSON.stringify(payload).slice(0, 8000)}`;
    const text = await NexaAiClient.callModel(prompt, { model: "analysis", tenantId: scope.tenantId, module: "finance", task: "reconciliation" });
    return { supported: true, suggestions: [{ rank: 1, text }] };
  } catch {
    return { supported: false, message: "schema gap or data unavailable", suggestions: [] };
  }
}


