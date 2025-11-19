import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getTenantKey, listTenantKeys } from "@/server/security/byokProvider";
import { BYOK_ENABLED, BYOK_KEY_PROVIDER } from "@/server/security/byokConfig";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:super");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const targetTenantId = searchParams.get("tenantId") || tenantId;

    const tenantKey = await getTenantKey(targetTenantId);
    const keysList = await listTenantKeys(targetTenantId);

    return Response.json({
      ok: true,
      data: {
        byokEnabled: BYOK_ENABLED,
        provider: BYOK_KEY_PROVIDER,
        configured: tenantKey.supported,
        tenantKey: {
          supported: tenantKey.supported,
          region: tenantKey.region,
          keyId: tenantKey.keyId,
          provider: tenantKey.provider,
          version: tenantKey.version,
          algorithm: tenantKey.algorithm,
          rotatedAt: tenantKey.rotatedAt?.toISOString(),
          createdAt: tenantKey.createdAt?.toISOString(),
          reason: tenantKey.reason,
        },
        keysSummary: {
          total: keysList.supported ? keysList.keys.length : 0,
          lastRotatedAt: keysList.supported && keysList.keys.length > 0 ? keysList.keys[0].rotatedAt.toISOString() : undefined,
        },
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}
