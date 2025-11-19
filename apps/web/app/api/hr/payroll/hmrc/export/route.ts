import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { buildHmrcSubmissionPayload, exportHmrcFile } from "@/server/hr/hmrc";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("hr:payroll:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const requestEntityId = searchParams.get("entityId") || undefined;
    const runId = searchParams.get("runId") || "";
    const format = (searchParams.get("format") || "csv") as "csv" | "json";
    
    if (!runId) return Response.json({ ok: false, error: "missing_runId" }, { status: 400 });
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    const scope = await resolveLegalEntityScope(requestEntityId || tenantId);
    await assertLegalEntityAccess(scope);
    
    // Try enhanced RTI export first
    try {
      const { exportHmrcRtiFile } = await import("@/server/hr/hmrc");
      const file = await exportHmrcRtiFile(scope, runId, format);
      const contentType = format === "json" ? "application/json" : "text/csv";
      return new Response(file, {
        headers: {
          "content-type": contentType,
          "content-disposition": `attachment; filename="rti-${runId}.${format}"`,
        },
      });
    } catch (error: any) {
      // Fallback to basic export
      console.warn(`[HMRC] Enhanced RTI export failed, using basic mode:`, error);
      const payload = await buildHmrcSubmissionPayload(scope, runId);
      const file = exportHmrcFile({ tenantId: scope.tenantId }, payload);
      return new Response(file, { headers: { "content-type": "application/json" } });
    }
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


