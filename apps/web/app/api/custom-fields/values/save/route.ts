import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { upsertValuesForEntity } from "@/server/customFields/valuesService";
import { captureError } from "@/server/observability/sentry";

const Body = z.object({
  entityType: z.string(),
  entityId: z.string(),
  values: z.record(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:customfields:admin");
    const { tenantId } = await assertTenantScope();

    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);

    const result = await upsertValuesForEntity(tenantId, body.entityType, body.entityId, body.values);

    if (!result.supported) {
      return Response.json(
        {
          ok: false,
          supported: false,
          error: result.reason || "Schema gap: CustomFieldValue storage not available",
        },
        { status: 501 }
      );
    }

    return Response.json({
      ok: true,
      supported: true,
      values: result.values,
    });
  } catch (error: any) {
    captureError(error, { module: "customFields", operation: "save_values" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

