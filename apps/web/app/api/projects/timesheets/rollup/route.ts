import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rollupTimesheets } from "@/server/projects/costs";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";
import { incMetric } from "@/lib/observability/metrics";

const Sheet = z.object({ projectCode: z.string().min(1), userId: z.string().min(1), minutes: z.coerce.number().int().nonnegative(), hourlyRateMinor: z.coerce.number().int().nonnegative() });
const Body = z.object({ sheets: z.array(Sheet).min(1), tenantId: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    await requirePermissionServer("projects:timesheet_rollup");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    Sentry.addBreadcrumb({ category: "erp.logic", message: "projects.timesheets.rollup", level: "info", data: { tenantId, count: body.sheets.length } });

    await rollupTimesheets(tenantId, body.sheets, userId);
    await incMetric("erp_projects_rollup_total", { tenant: tenantId, ok: 1 });
    return Response.json({ ok: true });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


