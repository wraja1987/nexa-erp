import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type Timesheet = { projectCode: string; userId: string; minutes: number; hourlyRateMinor: number };

/**
 * Roll up timesheets into KpiSnapshot as `project:{code}:cost` with value in minor units.
 * Schema is read-only, so we persist summary snapshots rather than raw timesheets.
 */
export async function rollupTimesheets(tenantId: string, sheets: Timesheet[], actorId: string) {
  const costByProject = new Map<string, number>();
  for (const s of sheets) {
    const cost = Math.round((s.minutes / 60) * s.hourlyRateMinor);
    costByProject.set(s.projectCode, (costByProject.get(s.projectCode) || 0) + cost);
  }
  const writes = Array.from(costByProject.entries()).map(([code, value]) =>
    prisma.kpiSnapshot.upsert({
      where: { tenantId_name_asOf: { tenantId, name: `project:${code}:cost`, asOf: new Date(new Date().toDateString()) } as any },
      update: { value: value as any },
      create: { tenantId, name: `project:${code}:cost`, value: value as any },
    })
  );
  await Promise.all(writes);
  await auditEvent("projects.timesheets.rolled_up", { tenantId, actorId, projects: Array.from(costByProject.keys()) });
}


