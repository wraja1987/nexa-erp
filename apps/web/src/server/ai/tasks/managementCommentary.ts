import { AI_ENGINE_ENABLED } from "@/server/ai/config";
import { NexaAiClient } from "@/server/ai/client";
import { FINANCE_MANAGEMENT_COMMENTARY_V1 } from "@/server/ai/prompts/finance";
import { getAllKpis } from "@/server/analytics/kpi";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function getManagementCommentary(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!AI_ENGINE_ENABLED) return { supported: false, message: "AI_ENGINE_DISABLED", commentary: "" };
  const kpis = await getAllKpis(scope);
  const prompt = `${FINANCE_MANAGEMENT_COMMENTARY_V1}\nKPIs:\n${JSON.stringify(kpis).slice(0, 8000)}`;
  const text = await NexaAiClient.callModel(prompt, { model: "analysis", tenantId: scope.tenantId, module: "management", task: "commentary" });
  return { supported: true, commentary: text };
}


