import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getReconciliationSuggestions } from "@/server/ai/tasks/financeReconciliation";

export async function GET() {
  await requirePermissionServer("ui:ai:finance");
  const { tenantId } = await getSessionContext();
  const data = await getReconciliationSuggestions({ tenantId });
  return Response.json({ ok: true, data });
}


