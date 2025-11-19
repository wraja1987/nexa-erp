"use client";

import { useState, useEffect } from "react";
import Page from "@/components/layout/Page";
import { ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/Button";

export default function ProjectBillingPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [billingMode, setBillingMode] = useState<"TIME_AND_MATERIALS" | "MILESTONE" | "FIXED_FEE">("TIME_AND_MATERIALS");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects/projects/list");
      const json = await res.json();
      if (json.ok) {
        setProjects(json.data || []);
      }
    } catch (e: any) {
      console.error("Failed to load projects:", e);
    }
  }

  async function loadPreview() {
    if (!selectedProject) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `/api/projects/billing/preview?projectId=${encodeURIComponent(selectedProject)}&mode=${billingMode}`
      );
      const json = await res.json();
      if (json.ok) {
        setPreview(json.data);
      } else {
        setError(json.error || "Failed to load preview");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }

  async function createInvoice() {
    if (!selectedProject || !preview) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/projects/billing/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          mode: billingMode,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccess(`Invoice created: ${json.invoice?.number || json.invoice?.id}`);
        setPreview(null);
        await loadProjects();
      } else {
        setError(json.error || "Failed to create invoice");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="Projects • Billing">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.code || p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Billing Mode</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={billingMode}
              onChange={(e) => setBillingMode(e.target.value as any)}
            >
              <option value="TIME_AND_MATERIALS">Time & Materials</option>
              <option value="MILESTONE">Milestone</option>
              <option value="FIXED_FEE">Fixed Fee</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={loadPreview}
              disabled={!selectedProject || loading}
            >
              Preview Billing
            </Button>
            {preview && (
              <ActionButton
                label="Create Invoice"
                onClick={createInvoice}
                onSuccess={() => {
                  setSuccess("Invoice created successfully");
                  setPreview(null);
                }}
                onError={(err) => setError(err)}
              />
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {success}
            </div>
          )}

          {preview && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Billing Preview</h3>
              <div className="text-sm space-y-1">
                <div>Total: £{Number(preview.total || 0).toFixed(2)}</div>
                <div>Tax: £{Number(preview.tax || 0).toFixed(2)}</div>
                <div>Lines: {preview.lines?.length || 0}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
