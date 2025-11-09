import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";
import { normalizeRole } from "@/lib/rbac/matrix";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";

const Body = z.object({ userId: z.string().min(1), role: z.string().min(1), tenantId: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    const { userId: actorId, role: actorRole } = await requirePermissionServer("admin:role_change");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    Sentry.addBreadcrumb({ category: "erp.logic", message: "admin.role_change", level: "info", data: { tenantId, target: body.userId, role: body.role } });

    const role = normalizeRole(body.role);
    // Separation of duties: only SUPER_ADMIN can set SUPER_ADMIN; ADMIN cannot change self
    if (role === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
      return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    if (body.userId === actorId && actorRole === "ADMIN") {
      return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    const updated = await prisma.user.update({ where: { id: body.userId }, data: { role } as any });
    await auditEvent("admin.user.role_changed", { actorId, target: body.userId, tenantId, role });
    return Response.json({ ok: true, user: { id: updated.id, role: updated.role } });
  } catch (e: any) {
    const code = e?.code || 403;
    return Response.json({ ok: false, error: String(e?.message || "forbidden") }, { status: code });
  }
}


