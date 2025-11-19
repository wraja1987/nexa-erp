"use client";

import Page from "@/components/layout/Page";
import * as React from "react";

export default function BankingImportPage() {
  const [accountCode, setAccountCode] = React.useState("MAIN");
  const [csv, setCsv] = React.useState("");
  const [preview, setPreview] = React.useState<any>(null);
  const [info, setInfo] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  const doPreview = async () => {
    setBusy(true);
    setInfo("");
    try {
      const res = await fetch("/api/banking/statements/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json().catch(() => ({}));
      setPreview(data?.ok ? data : null);
      setInfo(data?.ok ? `Parsed ${data?.count} rows` : `Error: ${data?.error || "preview_failed"}`);
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    setBusy(true);
    setInfo("");
    try {
      const res = await fetch("/api/banking/statements/import", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": String(Date.now()) },
        body: JSON.stringify({ accountCode, csv }),
      });
      const data = await res.json().catch(() => ({}));
      setInfo(data?.ok ? `Imported ${data?.created} lines` : `Error: ${data?.error || "import_failed"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Banking — Statement Import">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm">
              Account Code
              <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={accountCode} onChange={(e) => setAccountCode(e.target.value)} />
            </label>
          </div>
          <label className="text-sm block">
            CSV (date,description,amount,reference)
            <textarea className="block mt-1 border rounded-md px-2 py-1 w-full min-h-[160px]" value={csv} onChange={(e) => setCsv(e.target.value)} />
          </label>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border" onClick={doPreview} disabled={busy}>Preview</button>
            <button className="px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-blue)" }} onClick={doImport} disabled={busy || !csv}>Import</button>
          </div>
          {info && <div className="text-sm">{info}</div>}
          {preview?.rows?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">{r.description}</td>
                      <td className="p-2">{r.amount}</td>
                      <td className="p-2">{r.reference || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </Page>
  );
}


