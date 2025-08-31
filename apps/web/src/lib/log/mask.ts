export function maskPII(v: string): string {
  if (!v) return v;
  const ipv4 = v.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, "$1.xxx.xxx.xxx");
  return ipv4.replace(/\b([a-zA-Z0-9]{5,})\b/g, (m) => m.slice(0, 4) + "****");
}

export function safeAudit(obj: Record<string, any>) {
  const masked: any = { ...obj };
  if (masked.ip) masked.ip = maskPII(String(masked.ip));
  if (masked.session) masked.session = maskPII(String(masked.session));
  masked.hasMasked = true;
  return masked;
}

export function audit(payload: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.log('[assistant_audit]', safeAudit(payload));
}


