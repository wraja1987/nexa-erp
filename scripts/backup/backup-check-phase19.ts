#!/usr/bin/env tsx
/**
 * Backup Check Script (Phase 19)
 * Task 8 Gap Closure: Full DB-backed implementation using BackupPolicy and BackupRun models
 * Validates backup configuration and outputs a compliance report.
 * Does not perform any backup or destructive actions.
 */

import { PrismaClient } from "@prisma/client";
import { getTenantRegion } from "../../apps/web/src/server/security/byokProvider";

const prisma = new PrismaClient();

const BACKUP_ENCRYPTED = process.env.NEXA_BACKUP_ENCRYPTED === "true";
const BACKUP_RETENTION_DAYS = parseInt(process.env.NEXA_BACKUP_RETENTION_DAYS || "7", 10);

interface BackupReport {
  tenantId?: string;
  region: string;
  policyConfigured: boolean;
  policyFrequency?: string;
  policyRetentionDays?: number;
  policyEnabled?: boolean;
  lastBackupAt?: Date;
  lastBackupStatus?: string;
  retentionDays: number;
  encrypted: boolean;
  issues: string[];
  status: "OK" | "NEEDS_ATTENTION";
  compliant: boolean;
}

/**
 * Get required retention days for a region.
 */
function getRequiredRetentionDays(region: string): number {
  const mapping: Record<string, number> = {
    UK: 30,
    EU: 30,
    GCC: 90,
    US: 30,
  };
  return mapping[region] || 7;
}

/**
 * Generate backup compliance report.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function generateBackupReport(tenantId?: string): Promise<BackupReport> {
  const region = tenantId ? await getTenantRegion(tenantId) : (process.env.NEXA_DEFAULT_REGION || "UNKNOWN");
  const requiredRetention = getRequiredRetentionDays(region);

  const issues: string[] = [];

  // Load backup policy from DB if tenantId provided
  let policyConfigured = false;
  let policyFrequency: string | undefined;
  let policyRetentionDays: number | undefined;
  let policyEnabled: boolean | undefined;
  let lastBackupAt: Date | undefined;
  let lastBackupStatus: string | undefined;

  if (tenantId) {
    try {
      const policy = await prisma.backupPolicy.findFirst({
        where: { tenantId },
        include: {
          BackupRun: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: {
              status: true,
              startedAt: true,
              completedAt: true,
            },
          },
        },
      });

      if (policy) {
        policyConfigured = true;
        policyFrequency = policy.frequency;
        policyRetentionDays = policy.retentionDays;
        policyEnabled = policy.enabled;

        if (policy.BackupRun.length > 0) {
          const lastRun = policy.BackupRun[0];
          lastBackupAt = lastRun.completedAt || lastRun.startedAt;
          lastBackupStatus = lastRun.status;
        }
      } else {
        issues.push("No backup policy configured for tenant");
      }
    } catch (error: any) {
      issues.push(`Failed to load backup policy: ${error?.message || "unknown"}`);
    }
  }

  // Check encryption
  if (!BACKUP_ENCRYPTED) {
    issues.push("Backup encryption is not enabled (NEXA_BACKUP_ENCRYPTED != true)");
  }

  // Check retention
  const effectiveRetention = policyRetentionDays || BACKUP_RETENTION_DAYS;
  if (effectiveRetention < requiredRetention) {
    issues.push(
      `Backup retention (${effectiveRetention} days) is below required minimum (${requiredRetention} days) for region ${region}`
    );
  }

  // Check if retention is set
  if (!policyRetentionDays && !process.env.NEXA_BACKUP_RETENTION_DAYS) {
    issues.push("Backup retention period is not set (NEXA_BACKUP_RETENTION_DAYS not configured and no policy found)");
  }

  // Check if region is unknown
  if (region === "UNKNOWN") {
    issues.push("Tenant region is unknown (cannot verify region-specific requirements)");
  }

  // Check if policy is disabled
  if (policyConfigured && policyEnabled === false) {
    issues.push("Backup policy is disabled");
  }

  // Check last backup age
  if (lastBackupAt) {
    const daysSinceBackup = Math.floor((Date.now() - lastBackupAt.getTime()) / (1000 * 60 * 60 * 24));
    if (policyFrequency === "daily" && daysSinceBackup > 1) {
      issues.push(`Last backup was ${daysSinceBackup} days ago (expected daily)`);
    } else if (policyFrequency === "weekly" && daysSinceBackup > 7) {
      issues.push(`Last backup was ${daysSinceBackup} days ago (expected weekly)`);
    } else if (policyFrequency === "monthly" && daysSinceBackup > 30) {
      issues.push(`Last backup was ${daysSinceBackup} days ago (expected monthly)`);
    }
  } else if (policyConfigured && policyEnabled) {
    issues.push("No backup runs found (backup may not have been executed)");
  }

  // Check last backup status
  if (lastBackupStatus === "failed") {
    issues.push("Last backup run failed");
  }

  const compliant = issues.length === 0;

  return {
    tenantId,
    region,
    policyConfigured,
    policyFrequency,
    policyRetentionDays,
    policyEnabled,
    lastBackupAt,
    lastBackupStatus,
    retentionDays: effectiveRetention,
    encrypted: BACKUP_ENCRYPTED,
    issues,
    status: compliant ? "OK" : "NEEDS_ATTENTION",
    compliant,
  };
}

/**
 * Main execution.
 */
async function main() {
  const tenantId = process.argv[2]; // Optional tenant ID argument

  console.log("=== Backup Compliance Report ===\n");

  try {
    const report = await generateBackupReport(tenantId);

    if (report.tenantId) {
      console.log(`Tenant ID: ${report.tenantId}`);
    }
    console.log(`Region: ${report.region}`);
    console.log(`Policy Configured: ${report.policyConfigured ? "Yes" : "No"}`);
    if (report.policyConfigured) {
      console.log(`Policy Frequency: ${report.policyFrequency}`);
      console.log(`Policy Retention: ${report.policyRetentionDays} days`);
      console.log(`Policy Enabled: ${report.policyEnabled ? "Yes" : "No"}`);
    }
    if (report.lastBackupAt) {
      console.log(`Last Backup: ${report.lastBackupAt.toISOString()} (${report.lastBackupStatus})`);
    }
    console.log(`Effective Retention: ${report.retentionDays} days`);
    console.log(`Encrypted: ${report.encrypted ? "Yes" : "No"}`);
    console.log(`Status: ${report.status}`);
    console.log(`Compliant: ${report.compliant ? "Yes" : "No"}`);

    if (report.issues.length > 0) {
      console.log("\nIssues:");
      report.issues.forEach((issue) => {
        console.log(`  - ${issue}`);
      });
    } else {
      console.log("\n✓ All checks passed");
    }

    // Exit with error code if issues found
    process.exit(report.issues.length > 0 ? 1 : 0);
  } catch (error: any) {
    console.error("Error generating backup report:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Error generating backup report:", error);
    process.exit(1);
  });
}

export { generateBackupReport };
