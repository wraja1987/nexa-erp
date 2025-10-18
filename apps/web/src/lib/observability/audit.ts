export async function auditEvent(type: string, payload: Record<string,unknown>) {
  // Replace console with a real log sink (e.g. OpenTelemetry or your SIEM).
  console.log("[AUDIT]", new Date().toISOString(), type, JSON.stringify(payload));
}
