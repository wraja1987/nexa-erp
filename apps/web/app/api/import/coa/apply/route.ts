import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { previewCoaImport, applyCoaImport } from "@/server/imports/coa";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:manage");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { csv } = body;

    if (!csv || typeof csv !== "string") {
      return Response.json({ ok: false, error: "csv (string) required" }, { status: 400 });
    }

    // Preview first
    const preview = await previewCoaImport({ tenantId, userId }, csv);
    if (!preview.supported) {
      return Response.json({ ok: false, error: preview.message || "Not supported" }, { status: 501 });
    }

    // Apply
    const result = await applyCoaImport({ tenantId, userId }, preview.rows);

    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 501 });
    }

    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

