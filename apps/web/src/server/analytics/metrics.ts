/**
 * Phase 11 — Metrics Store
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export interface MetricInput {
  name: string;
  value: number;
  timestamp?: Date;
  dimensions?: Record<string, unknown>;
}

export interface MetricQuery {
  name?: string;
  start?: Date;
  end?: Date;
  dimensions?: Record<string, unknown>;
}

export async function recordMetric(
  scope: { tenantId: string; entityId?: string | null },
  input: MetricInput
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const metric = await prisma.metricPoint.create({
    data: {
      tenantId: scope.tenantId,
      name: input.name,
      value: input.value,
      timestamp: input.timestamp || new Date(),
      dimensions: input.dimensions || null,
    },
  });

  return { supported: true, data: metric };
}

export async function queryMetrics(
  scope: { tenantId: string; entityId?: string | null },
  query: MetricQuery
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const where: any = { tenantId: scope.tenantId };
  if (query.name) {
    where.name = query.name;
  }
  if (query.start || query.end) {
    where.timestamp = {};
    if (query.start) {
      where.timestamp.gte = query.start;
    }
    if (query.end) {
      where.timestamp.lte = query.end;
    }
  }

  const metrics = await prisma.metricPoint.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 1000, // Limit results
  });

  return { supported: true, data: metrics };
}
