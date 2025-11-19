"use client";

import { useState } from "react";

type ImportSectionProps = {
  title: string;
  exportEndpoint?: string;
  previewEndpoint: string;
  applyEndpoint: string;
  csvFormat: string;
};

export default function ImportSection({ title, exportEndpoint, previewEndpoint, applyEndpoint, csvFormat }: ImportSectionProps) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  async function handlePreview() {
    if (!csv.trim()) {
      alert("Please paste CSV content");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(previewEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });

      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "Preview failed");
        return;
      }

      setPreview(data.data);
    } catch (e: any) {
      alert(e?.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!preview || !preview.supported) {
      alert("Please preview first and ensure import is supported");
      return;
    }

    if (!confirm(`Apply import? ${preview.rows?.length || 0} rows will be processed.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(applyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });

      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "Apply failed");
        return;
      }

      setApplied(true);
      alert(`Import applied: ${data.data.applied} rows succeeded, ${data.data.errors?.length || 0} errors`);
    } catch (e: any) {
      alert(e?.message || "Apply failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!exportEndpoint) return;
    window.open(exportEndpoint, "_blank");
  }

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {exportEndpoint && (
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Export
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">CSV Format: {csvFormat}</label>
        <textarea
          value={csv}
          onChange={(e) => {
            setCsv(e.target.value);
            setPreview(null);
            setApplied(false);
          }}
          placeholder="Paste CSV content here..."
          className="w-full h-32 p-2 border rounded text-sm font-mono"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePreview}
          disabled={loading || !csv.trim()}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Preview"}
        </button>
        {preview && preview.supported && (
          <button
            onClick={handleApply}
            disabled={loading || applied}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Applying..." : applied ? "Applied" : "Apply"}
          </button>
        )}
      </div>

      {preview && (
        <div className="text-sm space-y-2">
          {!preview.supported ? (
            <div className="text-red-600">{preview.message || "Import not supported"}</div>
          ) : (
            <>
              <div>
                <strong>Rows:</strong> {preview.rows?.length || 0} valid, {preview.errors?.length || 0} errors
              </div>
              {preview.totals && (
                <div>
                  <strong>Totals:</strong> Debit {preview.totals.debit?.toFixed(2) || 0}, Credit{" "}
                  {preview.totals.credit?.toFixed(2) || 0}
                </div>
              )}
              {preview.errors && preview.errors.length > 0 && (
                <div className="mt-2">
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {preview.errors.slice(0, 10).map((err: any, idx: number) => (
                      <li key={idx} className="text-red-600">
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                    {preview.errors.length > 10 && <li>... and {preview.errors.length - 10} more</li>}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

