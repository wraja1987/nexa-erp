"use client";

import * as React from "react";

export default function PayrollActionsClient() {
  const [periodStart, setPeriodStart] = React.useState<string>("");
  const [periodEnd, setPeriodEnd] = React.useState<string>("");
  const [runId, setRunId] = React.useState<string>("");
  const [msg, setMsg] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  const buildRun = async () => {
    if (!periodStart || !periodEnd) {
      setMsg("Please provide periodStart and periodEnd (YYYY-MM-DD).");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/hr/payroll/run/build", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ periodStart, periodEnd }),
      });
      const data = await r.json().catch(() => ({}));
      if (data?.ok) {
        setMsg(`Built run ${data?.run?.id || ""}`);
      } else {
        setMsg(`Build failed: ${data?.error || "error"}`);
      }
    } catch (e: any) {
      setMsg(`Error: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const commitRun = async () => {
    if (!runId) {
      setMsg("Provide runId to commit.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/hr/payroll/run/commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const data = await r.json().catch(() => ({}));
      if (data?.ok) {
        setMsg(`Committed run ${runId}`);
      } else {
        setMsg(`Commit failed: ${data?.error || "error"}`);
      }
    } catch (e: any) {
      setMsg(`Error: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Period Start (YYYY-MM-DD)
          <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} placeholder="2025-11-01" />
        </label>
        <label className="text-sm">
          Period End (YYYY-MM-DD)
          <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} placeholder="2025-11-30" />
        </label>
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-blue)" }} onClick={buildRun} disabled={busy}>
          Build Pay Run
        </button>
        <label className="text-sm">
          Run ID
          <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={runId} onChange={(e) => setRunId(e.target.value)} />
        </label>
        <button className="px-4 py-2 rounded-lg border" onClick={commitRun} disabled={busy || !runId}>
          Commit Pay Run
        </button>
      </div>
      {msg ? <div className="text-sm" style={{ color: "var(--color-muted)" }}>{msg}</div> : null}
    </div>
  );
}


