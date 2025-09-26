export async function auditEvent(event: string, meta?: Record<string, unknown>): Promise<boolean> {
  console.log("[audit]", event, meta || {});
  return true;
}

export default { auditEvent };




