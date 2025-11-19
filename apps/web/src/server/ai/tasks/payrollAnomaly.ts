import { AI_ENGINE_ENABLED } from "@/server/ai/config";
import { NexaAiClient } from "@/server/ai/client";
import { PAYROLL_ANOMALY_PROMPT_V1 } from "@/server/ai/prompts/payroll";
import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { stripPiiFromEmployee } from "@/server/ai/pseudo";

export async function getPayrollAnomalies(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!AI_ENGINE_ENABLED) return { supported: false, message: "AI_ENGINE_DISABLED", anomalies: [] };
  try {
    const runs = await prisma.payrollRun.findMany({ where: { tenantId: scope.tenantId }, take: 24, orderBy: { periodEnd: "desc" } as any });
    const slips = await prisma.payslip.findMany({ where: { tenantId: scope.tenantId }, take: 500 });
    const masked = slips.map((s) => stripPiiFromEmployee(s));
    const prompt = `${PAYROLL_ANOMALY_PROMPT_V1}\nRuns/Slips:\n${JSON.stringify({ runs, slips: masked }).slice(0, 8000)}`;
    const text = await NexaAiClient.callModel(prompt, { model: "analysis", tenantId: scope.tenantId, module: "hr", task: "payroll_anomaly" });
    return { supported: true, anomalies: [{ note: text }] };
  } catch {
    return { supported: false, message: "schema gap or HR/payroll unavailable", anomalies: [] };
  }
}


