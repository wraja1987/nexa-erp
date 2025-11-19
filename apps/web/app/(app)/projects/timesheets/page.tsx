"use client";

import { useState, useEffect } from "react";
import Page from "@/components/layout/Page";
import { ActionButton } from "@/components/ui/ActionButton";

export default function ProjectTimesheetsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/timesheets/list");
      const json = await res.json();
      if (json.ok) {
        setRows(json.data || []);
      } else {
        setError(json.error || "Failed to load timesheets");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load timesheets");
    } finally {
      setLoading(false);
    }
  }

  async function approveTimesheet(timesheetId: string) {
    try {
      const res = await fetch(`/api/projects/timesheets/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timesheetId }),
      });
      const json = await res.json();
      if (json.ok) {
        await load(); // Refresh list
        return json;
      } else {
        throw new Error(json.error || "Failed to approve");
      }
    } catch (e: any) {
      throw e;
    }
  }

  if (loading) {
    return (
      <Page title="Projects • Timesheets">
        <div className="rounded-2xl border bg-white p-6">Loading…</div>
      </Page>
    );
  }

  return (
    <Page title="Projects • Timesheets">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        {rows?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Project</th>
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Hours</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pr-4">{r.project?.name || r.projectId}</td>
                    <td className="py-2 pr-4">{r.employee?.name || r.employeeId}</td>
                    <td className="py-2 pr-4">{Number(r.hours || 0).toFixed(2)}</td>
                    <td className="py-2 pr-4">{r.status || "submitted"}</td>
                    <td className="py-2 pr-4">
                      {r.status === "submitted" && (
                        <ActionButton
                          label="Approve"
                          onClick={() => approveTimesheet(r.id)}
                          onSuccess={() => {
                            // List will refresh
                          }}
                          variant="primary"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            No timesheets available.
          </div>
        )}
      </div>
    </Page>
  );
}
