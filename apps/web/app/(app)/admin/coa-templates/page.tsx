"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type CoATemplate = {
  id: string;
  name: string;
  description: string;
};

type CoAPreview = {
  supported: boolean;
  templateId: string;
  existingAccounts: Array<{ code: string; name: string; type: string }>;
  newAccounts: Array<{ code: string; name: string; type: string }>;
  message?: string;
};

export default function CoATemplatesPage() {
  const [templates, setTemplates] = useState<CoATemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [preview, setPreview] = useState<CoAPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/coa-templates/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setTemplates(data.data);
        }
      });
  }, []);

  const handlePreview = async (templateId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coa-templates/preview?templateId=${templateId}`);
      const data = await res.json();
      if (data.ok) {
        setPreview(data.data);
        setSelectedTemplate(templateId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;
    setApplying(true);
    try {
      const res = await fetch("/api/admin/coa-templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate }),
      });
      const data = await res.json();
      setApplyResult(data);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Page title="Chart of Accounts Templates">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Available Templates</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                style={{ borderColor: "var(--border)" }}
                onClick={() => handlePreview(t.id)}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                  {t.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {preview && (
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4">Preview: {preview.templateId}</h2>
            {!preview.supported && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm text-yellow-800">{preview.message}</div>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Existing Accounts ({preview.existingAccounts.length})</h3>
                <div className="text-sm space-y-1">
                  {preview.existingAccounts.length === 0 ? (
                    <div style={{ color: "var(--color-muted)" }}>None</div>
                  ) : (
                    preview.existingAccounts.map((acc) => (
                      <div key={acc.code}>
                        {acc.code} - {acc.name} ({acc.type})
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">New Accounts ({preview.newAccounts.length})</h3>
                <div className="text-sm space-y-1">
                  {preview.newAccounts.length === 0 ? (
                    <div style={{ color: "var(--color-muted)" }}>None (all accounts already exist)</div>
                  ) : (
                    preview.newAccounts.map((acc) => (
                      <div key={acc.code}>
                        {acc.code} - {acc.name} ({acc.type})
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {preview.newAccounts.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ background: "var(--color-blue)" }}
                >
                  {applying ? "Applying..." : "Apply Template"}
                </button>
              </div>
            )}
          </div>
        )}

        {applyResult && (
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4">Apply Result</h2>
            {applyResult.ok ? (
              <div className="space-y-2">
                <div>Accounts Created: {applyResult.data?.accountsCreated || 0}</div>
                <div>Accounts Skipped: {applyResult.data?.accountsSkipped || 0}</div>
                {applyResult.data?.message && (
                  <div className="text-sm mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    {applyResult.data.message}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-800">
                  {applyResult.error || "Failed to apply template"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

