"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type Claim = {
  id: string;
  practiceId?: string;
  practiceName?: string;
  roleId?: string;
  roleName?: string;
  period: string;
  amount: number;
  currency: string;
  status: string;
};

type ClaimListResult = {
  supported: boolean;
  claims: Claim[];
  message?: string;
};

type ClaimsPreview = {
  supported: boolean;
  period: string;
  practiceId?: string;
  practiceName?: string;
  shiftsByRole: Array<{
    role?: string;
    shiftCount: number;
    estimatedPayCost: number;
  }>;
  totalShifts: number;
  totalEstimatedCost: number;
  currency: string;
  message?: string;
};

export default function HealthcareClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [preview, setPreview] = useState<ClaimsPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/healthcare/claims/list")
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setClaims(data.data.claims);
            if (!data.data.supported && data.data.message) {
              setMessage(data.data.message);
            }
          }
        }),
      fetch(`/api/healthcare/claims/preview?period=${period}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setPreview(data.data);
          }
        }),
    ]).finally(() => setLoading(false));
  }, [period]);

  return (
    <Page title="Healthcare Claims">
      <div className="col-span-12 space-y-6">
        {message && (
          <div className="rounded-2xl border bg-yellow-50 p-6" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm text-yellow-800">{message}</div>
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Claims Preview</h2>
          <div className="mb-4">
            <label className="text-sm font-medium block mb-1">Period (YYYY-MM)</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>
          {preview && (
            <div className="space-y-4">
              {!preview.supported && preview.message && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm text-yellow-800">{preview.message}</div>
                </div>
              )}
              <div>
                <div className="font-medium">Total Shifts: {preview.totalShifts}</div>
                <div className="font-medium">
                  Total Estimated Cost: {preview.currency} {preview.totalEstimatedCost.toFixed(2)}
                </div>
              </div>
              {preview.shiftsByRole.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Breakdown by Role</h3>
                  <div className="space-y-2">
                    {preview.shiftsByRole.map((r, idx) => (
                      <div key={idx} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                        <div className="font-medium">{r.role || "Unknown Role"}</div>
                        <div className="text-sm">
                          Shifts: {r.shiftCount} | Estimated Cost: {preview.currency} {r.estimatedPayCost.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Claims List</h2>
          {loading ? (
            <div>Loading...</div>
          ) : claims.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              No claims found. {message || "Schema gap: Claims management requires schema migration."}
            </div>
          ) : (
            <div className="space-y-2">
              {claims.map((claim) => (
                <div key={claim.id} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="font-medium">
                    {claim.practiceName || `Practice ${claim.practiceId}`} - {claim.period}
                  </div>
                  <div className="text-sm">
                    {claim.roleName || claim.roleId || "Unknown Role"} | {claim.currency} {claim.amount.toFixed(2)} |{" "}
                    {claim.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

