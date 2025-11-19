import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { createOrUpdateDefinition } from "@/server/customFields/definitionsService";
import { captureError } from "@/server/observability/sentry";
import type { CustomFieldDefinition } from "@/server/customFields/types";

const Body = z.object({
  definition: z.object({
    id: z.string(),
    entityType: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "date", "boolean", "picklist", "multi-select", "reference"]),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
    helpText: z.string().optional(),
    order: z.number().optional(),
    visibility: z.array(z.enum(["detail", "list", "filter"])).optional(),
  }),
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

    const result = await createOrUpdateDefinition(tenantId, body.definition as CustomFieldDefinition);

    if (!result.supported) {
      return Response.json(
        {
          ok: false,
          supported: false,
          error: result.reason || "Schema gap: CustomFieldDefinition table not available",
        },
        { status: 501 }
      );
    }

    return Response.json({
      ok: true,
      supported: true,
      definition: result.definition,
    });
  } catch (error: any) {
    captureError(error, { module: "customFields", operation: "save_definition" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

