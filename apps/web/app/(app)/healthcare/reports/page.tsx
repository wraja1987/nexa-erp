"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type HealthcareOverview = {
  supported: boolean;
  period: string;
  practiceCount: number;
  pcnCount: number;
  totalStaff: number;
  totalRotaShifts: number;
  totalStaffCost: number;
  currency: string;
  kpis: Record<string, number>;
  message?: string;
};

export default function HealthcareReportsPage() {
  const [overview, setOverview] = useState<HealthcareOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    setLoading(true);
    fetch(`/api/healthcare/reports/overview?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setOverview(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <Page title="Healthcare Reports">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Healthcare Overview</h2>
          <div className="mb-4">
            <label className="text-sm font-medium block mb-1">Period (YYYY-MM)</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>
          {overview && (
            <div className="space-y-4">
              {!overview.supported && overview.message && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm text-yellow-800">{overview.message}</div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Practices
                  </div>
                  <div className="text-2xl font-semibold">{overview.practiceCount}</div>
                </div>
                <div className="border rounded p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    PCNs
                  </div>
                  <div className="text-2xl font-semibold">{overview.pcnCount}</div>
                </div>
                <div className="border rounded p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Total Staff
                  </div>
                  <div className="text-2xl font-semibold">{overview.totalStaff}</div>
                </div>
                <div className="border rounded p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Rota Shifts
                  </div>
                  <div className="text-2xl font-semibold">{overview.totalRotaShifts}</div>
                </div>
                <div className="border rounded p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Total Staff Cost
                  </div>
                  <div className="text-2xl font-semibold">
                    {overview.currency} {overview.totalStaffCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Practice & PCN Reports</h2>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Practice and PCN-specific reports require Practice and Pcn models (schema gap). Use the overview above for
            aggregate data.
          </div>
        </div>
      </div>
    </Page>
  );
}

