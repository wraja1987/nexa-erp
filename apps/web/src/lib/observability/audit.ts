import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getRedis } from "@/lib/redis";

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = k.toLowerCase();
    if (key.includes("password") || key.includes("secret")) {
      clone[k] = "[redacted]";
    } else if (key === "reference") {
      clone[k] = typeof v === "string" && v.length > 4 ? v.slice(0, 2) + "…" + v.slice(-2) : "[redacted]";
    } else if (typeof v === "object" && v && !Array.isArray(v)) {
      clone[k] = sanitize(v as Record<string, unknown>);
    } else {
      clone[k] = v as unknown as any;
    }
  }
  // Cap object size to ~2KB stringified
  let json = JSON.stringify(clone);
  if (json.length > 2048) {
    // Keep first ~2KB
    json = json.slice(0, 2048);
    try { return JSON.parse(json); } catch { return { truncated: true }; }
  }
  return clone;
}

export async function auditEvent(type: string, payload: Record<string, unknown>) {
  try {
    const tenantId = String((payload as any).tenantId ?? "t-unknown");
    const actorId = String((payload as any).actorId ?? "anon");
    const target = String((payload as any).target ?? (payload as any).invoiceId ?? (payload as any).saleId ?? "-");
    const at = new Date();
    const safe = sanitize(payload || {});

    // Persist to DB if table present
    try {
      await prisma.auditLog.create({ data: { tenantId, actorId, action: type, target, at, data: safe as any } });
    } catch {}

    // Push to Redis list for quick Alerts rendering (best-effort)
    const redis = await getRedis();
    if (redis) {
      const key = `audit:${tenantId}`;
      await redis.lpush(key, JSON.stringify({ at: at.toISOString(), type, ...safe }));
      await redis.ltrim(key, 0, 200);
    }

    // Always console log as a fallback
    console.log("[AUDIT]", at.toISOString(), type, JSON.stringify(safe));
  } catch (err) {
    console.warn("auditEvent failed", err);
  }
}

// Best-effort transactional audit using a provided Prisma transaction client
export async function auditEventInTx(tx: Prisma.TransactionClient, type: string, payload: Record<string, unknown>) {
  try {
    const tenantId = String((payload as any).tenantId ?? "t-unknown");
    const actorId = String((payload as any).actorId ?? "anon");
    const target = String((payload as any).target ?? (payload as any).invoiceId ?? (payload as any).saleId ?? "-");
    const at = new Date();
    const safe = sanitize(payload || {});
    try { await (tx as any).auditLog.create({ data: { tenantId, actorId, action: type, target, at, data: safe as any } }); } catch {}
  } catch {}
}
