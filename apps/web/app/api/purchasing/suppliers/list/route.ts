import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listSuppliers } from "@/server/purchasing/suppliers";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await listSuppliers({ tenantId });
  return Response.json({ ok: true, data });
}


