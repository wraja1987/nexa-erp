import { AI_ENGINE_ENABLED } from "@/server/ai/config";
import { NexaAiClient } from "@/server/ai/client";
import { FINANCE_GL_ANOMALY_PROMPT_V1 } from "@/server/ai/prompts/finance";
import { getTrialBalance } from "@/server/finance/gl";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { stripPiiFromGenericRecord } from "@/server/ai/pseudo";

export async function getGlAnomalies(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!AI_ENGINE_ENABLED) return { supported: false, message: "AI_ENGINE_DISABLED", anomalies: [] };
  try {
    const tb = await getTrialBalance(scope.tenantId);
    const payload = stripPiiFromGenericRecord(tb);
    const prompt = `${FINANCE_GL_ANOMALY_PROMPT_V1}\nTrialBalance:\n${JSON.stringify(payload).slice(0, 8000)}`;
    const text = await NexaAiClient.callModel(prompt, { model: "analysis", tenantId: scope.tenantId, module: "finance", task: "gl_anomaly" });
    return { supported: true, anomalies: [{ note: text }] };
  } catch {
    return { supported: false, message: "schema gap or GL unavailable", anomalies: [] };
  }
}


