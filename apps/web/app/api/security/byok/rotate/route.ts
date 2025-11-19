import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { rotateTenantKey } from "@/server/security/byokProvider";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:super");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const targetTenantId = body.tenantId || tenantId;

    // Generate new key material (32 bytes for AES-256)
    const newKeyMaterial = randomBytes(32);

    const result = await rotateTenantKey(targetTenantId, newKeyMaterial, userId);

    if (!result.supported) {
      return Response.json({ ok: false, error: result.reason || "Failed to rotate key" }, { status: 400 });
    }

    return Response.json({
      ok: true,
      data: {
        oldKey: result.oldKey
          ? {
              id: result.oldKey.id,
              version: result.oldKey.version,
              rotatedAt: result.oldKey.rotatedAt.toISOString(),
            }
          : undefined,
        newKey: {
          id: result.newKey!.id,
          version: result.newKey!.version,
          algorithm: result.newKey!.algorithm,
          rotatedAt: result.newKey!.rotatedAt.toISOString(),
          createdAt: result.newKey!.createdAt.toISOString(),
        },
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

