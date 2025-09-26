export interface PosAudit { id: string; action: string; ts: string; user?: string; meta?: Record<string, any>; }
export async function recordPosAudit(entry: PosAudit): Promise<boolean> { console.log("[pos:audit]", entry); return true; }
export default { recordPosAudit };
export const posAudit = { record: recordPosAudit };
export async function auditPOS(action: string, meta?: Record<string, any>): Promise<boolean> {
  console.log("[pos:audit:event]", action, meta || {});
  return true;
}

