import { PrismaClient } from "@prisma/client";
import { Audit } from "../lib/audit/index";
import { sub } from "date-fns";

const prisma = new PrismaClient();
const DAYS_LOGS = parseInt(process.env.RETENTION_LOG_DAYS || "90", 10);
const DAYS_TRASH = parseInt(process.env.RETENTION_TRASH_DAYS || "30", 10);

async function main() {
  const start = Date.now();
  let deletedLogs = 0;
  let purgedTrash = 0;

  try {
    const threshold = sub(new Date(), { days: DAYS_LOGS });
    // Only delete if table exists
    const has = await prisma.$queryRawUnsafe<any[]>(
      `SELECT to_regclass('public.audit_logs') AS t`
    );
    if (has?.[0]?.t) {
      const r = await prisma.$executeRawUnsafe(
        `DELETE FROM audit_logs WHERE time < $1`,
        threshold
      );
      deletedLogs = Number(r) || 0;
    }
  } catch {}

  try {
    const has2 = await prisma.$queryRawUnsafe<any[]>(
      `SELECT to_regclass('public.some_entities') AS t`
    );
    if (has2?.[0]?.t) {
      const r2 = await prisma.$executeRawUnsafe(`
        DELETE FROM some_entities
        WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL '${DAYS_TRASH} days';
      `);
      purgedTrash = Number(r2) || 0;
    }
  } catch {}

  const seconds = (Date.now() - start) / 1000;
  Audit.audit({
    type: "retention.run",
    actor: "job:retention",
    ok: true,
    details: { deletedLogs, purgedTrash, seconds, DAYS_LOGS, DAYS_TRASH }
  });
  console.log(JSON.stringify({ ok: true, deletedLogs, purgedTrash, seconds }, null, 2));
}

main().finally(() => prisma.$disconnect());


