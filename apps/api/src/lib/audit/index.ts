import { appendFileSync, mkdirSync, existsSync } from "fs";
import { formatISO } from "date-fns";

const AUDIT_PATH = "reports/audit.jsonl";

export type AuditEvent = {
  time: string;
  type: string;
  actor?: string;
  tenantId?: string | null;
  target?: string | null;
  ok: boolean;
  details?: Record<string, any>;
};

export function audit(event: Omit<AuditEvent, "time">) {
  if (!existsSync("reports")) mkdirSync("reports");
  const entry = { time: formatISO(new Date()), ...event } as AuditEvent;
  appendFileSync(AUDIT_PATH, JSON.stringify(entry) + "\n");
  return entry;
}

export const Audit = { audit };







