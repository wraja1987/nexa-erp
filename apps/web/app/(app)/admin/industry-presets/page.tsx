"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type IndustryPreset = {
  id: string;
  name: string;
  description: string;
};

type PresetDetail = {
  id: string;
  name: string;
  description: string;
  suggestedModules: Record<string, boolean>;
  suggestedKpis: string[];
  suggestedCoATemplateId: string;
  recommendedSettings: {
    dashboards?: string[];
    reports?: string[];
  };
};

type ApplyResult = {
  supported: boolean;
  applied: boolean;
  presetId: string;
  recommendations: {
    coaTemplateId: string;
    modules: Record<string, boolean>;
    kpis: string[];
    dashboards?: string[];
    reports?: string[];
  };
  message?: string;
};

export default function IndustryPresetsPage() {
  const [presets, setPresets] = useState<IndustryPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetDetail, setPresetDetail] = useState<PresetDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  useEffect(() => {
    fetch("/api/admin/industry-presets/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setPresets(data.data);
        }
      });
  }, []);

  const handleViewDetail = async (presetId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/industry-presets/detail?presetId=${presetId}`);
      const data = await res.json();
      if (data.ok) {
        setPresetDetail(data.data);
        setSelectedPreset(presetId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedPreset) return;
    setApplying(true);
    try {
      const res = await fetch("/api/admin/industry-presets/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId: selectedPreset }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplyResult(data.data);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <Page title="Industry Presets">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Available Presets</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {presets.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                style={{ borderColor: "var(--border)" }}
                onClick={() => handleViewDetail(p.id)}
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                  {p.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {presetDetail && (
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4">Preset Details: {presetDetail.name}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Suggested Modules</h3>
                <div className="text-sm space-y-1">
                  {Object.entries(presetDetail.suggestedModules).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value ? "✓ Enabled" : "✗ Disabled"}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Suggested KPIs</h3>
                <ul className="text-sm list-disc list-inside">
                  {presetDetail.suggestedKpis.map((kpi) => (
                    <li key={kpi}>{kpi}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recommended CoA Template</h3>
                <div className="text-sm">{presetDetail.suggestedCoATemplateId}</div>
              </div>
              {presetDetail.recommendedSettings.dashboards && (
                <div>
                  <h3 className="font-medium mb-2">Recommended Dashboards</h3>
                  <ul className="text-sm list-disc list-inside">
                    {presetDetail.recommendedSettings.dashboards.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {presetDetail.recommendedSettings.reports && (
                <div>
                  <h3 className="font-medium mb-2">Recommended Reports</h3>
                  <ul className="text-sm list-disc list-inside">
                    {presetDetail.recommendedSettings.reports.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ background: "var(--color-blue)" }}
                >
                  {applying ? "Applying..." : "Apply Preset (Recommendations Only)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {applyResult && (
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4">Apply Result</h2>
            {applyResult.message && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm text-yellow-800">{applyResult.message}</div>
              </div>
            )}
            <div className="space-y-2">
              <div>
                <strong>CoA Template:</strong> {applyResult.recommendations.coaTemplateId}
              </div>
              <div>
                <strong>Modules:</strong>
                <ul className="list-disc list-inside ml-4">
                  {Object.entries(applyResult.recommendations.modules).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value ? "Enabled" : "Disabled"}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>KPIs:</strong>
                <ul className="list-disc list-inside ml-4">
                  {applyResult.recommendations.kpis.map((kpi) => (
                    <li key={kpi}>{kpi}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

