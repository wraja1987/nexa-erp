import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listContracts } from "@/server/purchasing/contracts";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await listContracts({ tenantId });
  return Response.json({ ok: true, data });
}


