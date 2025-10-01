export function maskPII(v: string): string {
  if (!v) return v;
  const ipv4 = v.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, "$1.xxx.xxx.xxx");
  return ipv4.replace(/\b([a-zA-Z0-9]{5,})\b/g, (m) => m.slice(0, 4) + "****");
}

export type AuditPayload = {
  ip?: string | number | undefined;
  session?: string | number | undefined;
  tenantId?: string;
  actorId?: string;
  action?: string;
  route?: string;
  module?: string;
} & Record<string, unknown>;

export function safeAudit(obj: AuditPayload): AuditPayload & { hasMasked: true } {
  const working: AuditPayload = { ...obj };
  if (working.ip !== undefined) working.ip = maskPII(String(working.ip));
  if (working.session !== undefined) working.session = maskPII(String(working.session));
  return { ...working, hasMasked: true } as AuditPayload & { hasMasked: true };
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export async function audit(payload: AuditPayload): Promise<void> {
  const entry = safeAudit(payload)
  console.log('[assistant_audit]', entry);
  try {
    bufferAudit(entry)
    // best-effort persist to DB (non-blocking)
    ;(async () => {
      try {
        const { prisma } = await import('../db')
        await prisma.auditLog.create({ data: {
          tenantId: String(entry.tenantId || 't1'),
          actorId: String(entry.actorId || 'system'),
          action: String(entry.action || 'event'),
          target: String(entry.route || entry.module || 'unknown'),
          at: new Date(),
          data: entry as unknown as JsonValue,
        } })
      } catch {}
    })()
  } catch {}
}

// Simple in-memory audit buffer for observability page
export type AuditEntry = ReturnType<typeof safeAudit> & { time?: string }
const _auditBuffer: AuditEntry[] = []
export function bufferAudit(entry: AuditEntry): void {
  const e = { ...entry, time: new Date().toISOString() }
  _auditBuffer.unshift(e)
  if (_auditBuffer.length > 500) _auditBuffer.pop()
}

export function getRecentAudits(filter?: { action?: string; module?: string }): AuditEntry[] {
  let list = _auditBuffer
  if (filter?.action) list = list.filter(e => String((e as Record<string, unknown>).action || '') === filter!.action)
  if (filter?.module) list = list.filter(e => String((e as Record<string, unknown>).module || '') === filter!.module)
  return list.slice(0, 100)
}


