type PosAuditEvent = {
  route: string;
  action?: string;
  eventType?: string;
  status?: string;
  shiftId?: string;
  saleId?: string;
  paymentId?: string;
  total?: number;
  method?: string;
};

/**
 * Exported as posAudit to match API route imports and tests.
 */
export async function posAudit(event: PosAuditEvent) {
  const payload = { at: new Date().toISOString(), ...event };
  // eslint-disable-next-line no-console
  console.log("[POS AUDIT]", payload);
}

// Back-compat alias used by some routes
export const auditPOS = async (...args: any[]) => {
  if (typeof args[0] === 'string') {
    const name = String(args[0]);
    const payload = (args[1] || {}) as Record<string, unknown>;
    const mapped: PosAuditEvent = { route: '/api/pos', eventType: name, ...(payload as any) };
    return posAudit(mapped);
  }
  return posAudit(args[0] as PosAuditEvent);
};
