"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

interface ByokStatus {
  byokEnabled: boolean;
  provider: string;
  tenantKey: {
    supported: boolean;
    region: string;
    keyId?: string;
    provider?: string;
    reason?: string;
  };
}

interface ResidencyStatus {
  tenantRegion: string;
  allowedRegions: Record<string, string[]>;
  reason?: string;
}

interface BackupStatus {
  encrypted: boolean;
  retentionDays: number;
  status: "OK" | "NEEDS_ATTENTION";
  issues: string[];
}

export default function SecurityPage() {
  const [byokStatus, setByokStatus] = useState<ByokStatus | null>(null);
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus | null>(null);
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        // Load BYOK status
        const byokRes = await fetch("/api/security/byok/status");
        if (byokRes.ok) {
          const byokData = await byokRes.json();
          setByokStatus(byokData.data);
        }

        // Load residency status
        const residencyRes = await fetch("/api/security/residency/status");
        if (residencyRes.ok) {
          const residencyData = await residencyRes.json();
          setResidencyStatus(residencyData.data);
        }

        // Load backup status (from env vars)
        const backupEncrypted = process.env.NEXT_PUBLIC_BACKUP_ENCRYPTED === "true";
        const backupRetentionDays = parseInt(process.env.NEXT_PUBLIC_BACKUP_RETENTION_DAYS || "7", 10);
        const issues: string[] = [];
        if (!backupEncrypted) {
          issues.push("Backup encryption not enabled");
        }
        if (backupRetentionDays < 7) {
          issues.push(`Backup retention (${backupRetentionDays} days) is below minimum (7 days)`);
        }
        setBackupStatus({
          encrypted: backupEncrypted,
          retentionDays: backupRetentionDays,
          status: issues.length === 0 ? "OK" : "NEEDS_ATTENTION",
          issues,
        });
      } catch (error) {
        console.error("Failed to load security status:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);

  return (
    <Page title="Security & Compliance">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-2">Security & Compliance</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            BYOK, data residency, and backup compliance status.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* BYOK Status */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">BYOK Status</h3>
              {byokStatus ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>BYOK Enabled:</strong> {byokStatus.byokEnabled ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Provider:</strong> {byokStatus.provider}
                  </div>
                  <div>
                    <strong>Tenant Key:</strong> {byokStatus.tenantKey.supported ? "Available" : "Not Available"}
                  </div>
                  <div>
                    <strong>Region:</strong> {byokStatus.tenantKey.region}
                  </div>
                  {byokStatus.tenantKey.keyId && (
                    <div>
                      <strong>Key ID:</strong> {byokStatus.tenantKey.keyId}
                    </div>
                  )}
                  {byokStatus.tenantKey.reason && (
                    <div className="text-red-600 mt-2">{byokStatus.tenantKey.reason}</div>
                  )}
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Failed to load BYOK status
                </div>
              )}
            </div>

            {/* Residency Status */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">Data Residency</h3>
              {residencyStatus ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Tenant Region:</strong> {residencyStatus.tenantRegion}
                  </div>
                  {residencyStatus.reason && (
                    <div className="text-red-600 mt-2">{residencyStatus.reason}</div>
                  )}
                  <div className="mt-4">
                    <strong>Allowed Regions by Module:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {Object.entries(residencyStatus.allowedRegions).map(([module, regions]) => (
                        <li key={module}>
                          {module}: {regions.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Failed to load residency status
                </div>
              )}
            </div>

            {/* Backup Status */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">Backup & Retention</h3>
              {backupStatus ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Encrypted:</strong> {backupStatus.encrypted ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Retention:</strong> {backupStatus.retentionDays} days
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span className={backupStatus.status === "OK" ? "text-green-600" : "text-red-600"}>
                      {backupStatus.status}
                    </span>
                  </div>
                  {backupStatus.issues.length > 0 && (
                    <div className="mt-2">
                      <strong>Issues:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {backupStatus.issues.map((issue, idx) => (
                          <li key={idx} className="text-red-600">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Failed to load backup status
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}

