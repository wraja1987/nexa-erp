import { AI_ENGINE_ENABLED } from "@/server/ai/config";
import { NexaAiClient } from "@/server/ai/client";
import { INVENTORY_ANOMALY_PROMPT_V1 } from "@/server/ai/prompts/inventory";
import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { stripPiiFromGenericRecord } from "@/server/ai/pseudo";

export async function getInventoryAnomalies(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!AI_ENGINE_ENABLED) return { supported: false, message: "AI_ENGINE_DISABLED", anomalies: [] };
  try {
    const items = await prisma.inventoryItem.findMany({ where: { tenantId: scope.tenantId }, take: 500 });
    const byWh = await prisma.inventoryItem.groupBy({
      by: ["warehouseId"],
      where: { tenantId: scope.tenantId },
      _sum: { qtyOnHand: true },
    });
    const payload = stripPiiFromGenericRecord({ items, byWh });
    const prompt = `${INVENTORY_ANOMALY_PROMPT_V1}\nStock:\n${JSON.stringify(payload).slice(0, 8000)}`;
    const text = await NexaAiClient.callModel(prompt, { model: "analysis", tenantId: scope.tenantId, module: "inventory", task: "inventory_anomaly" });
    return { supported: true, anomalies: [{ note: text }] };
  } catch {
    return { supported: false, message: "schema gap or inventory unavailable", anomalies: [] };
  }
}


