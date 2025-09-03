export function maskPII(v: string): string {
  if (!v) return v;
  const ipv4 = v.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, "$1.xxx.xxx.xxx");
  return ipv4.replace(/\b([a-zA-Z0-9]{5,})\b/g, (m) => m.slice(0, 4) + "****");
}

type AuditPayload = { ip?: unknown; session?: unknown } & Record<string, unknown>;

export function safeAudit(obj: AuditPayload): AuditPayload & { hasMasked: true } {
  const working: AuditPayload = { ...obj };
  if (working.ip !== undefined) working.ip = maskPII(String(working.ip));
  if (working.session !== undefined) working.session = maskPII(String(working.session));
  return { ...working, hasMasked: true } as AuditPayload & { hasMasked: true };
}

export function audit(payload: AuditPayload): void {
  const entry = safeAudit(payload)
  console.log('[assistant_audit]', entry);
  try {
    bufferAudit(entry)
  } catch {}
}

// Simple in-memory audit buffer for observability page
type AuditEntry = ReturnType<typeof safeAudit> & { time?: string }
const _auditBuffer: AuditEntry[] = []
export function bufferAudit(entry: AuditEntry): void {
  const e = { ...entry, time: new Date().toISOString() }
  _auditBuffer.unshift(e)
  if (_auditBuffer.length > 500) _auditBuffer.pop()
}

export function getRecentAudits(filter?: { action?: string; module?: string }): AuditEntry[] {
  let list = _auditBuffer
  if (filter?.action) list = list.filter(e => String(e.action||'') === filter!.action)
  if (filter?.module) list = list.filter(e => String(e.module||'') === filter!.module)
  return list.slice(0, 100)
}


