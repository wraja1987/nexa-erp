"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type Localisation = {
  supported: boolean;
  locale: string;
  currency: string;
  timezone: string;
  message?: string;
};

export default function LocalisationPage() {
  const [localisation, setLocalisation] = useState<Localisation | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ locale: "", currency: "", timezone: "" });
  const [updateResult, setUpdateResult] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/localisation/get")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setLocalisation(data.data);
          setFormData({
            locale: data.data.locale,
            currency: data.data.currency,
            timezone: data.data.timezone,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/localisation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setUpdateResult(data);
      if (data.ok) {
        // Refresh
        const refreshRes = await fetch("/api/admin/localisation/get");
        const refreshData = await refreshRes.json();
        if (refreshData.ok) {
          setLocalisation(refreshData.data);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page title="Localisation">
        <div className="col-span-12">Loading...</div>
      </Page>
    );
  }

  return (
    <Page title="Localisation">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Current Settings</h2>
          {localisation && (
            <div className="space-y-4">
              {!localisation.supported && localisation.message && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm text-yellow-800">{localisation.message}</div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Locale</label>
                  <div className="mt-1">{localisation.locale}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <div className="mt-1">{localisation.currency}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <div className="mt-1">{localisation.timezone}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Update Settings</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium block mb-1">Locale</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              >
                <option value="en-GB">en-GB</option>
                <option value="en-US">en-US</option>
                <option value="fr-FR">fr-FR</option>
                <option value="de-DE">de-DE</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Currency</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Timezone</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: "var(--color-blue)" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {updateResult && (
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold mb-4">Update Result</h2>
            {updateResult.ok ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm text-green-800">
                  {updateResult.data?.message || "Settings updated successfully"}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-800">{updateResult.error || "Failed to update settings"}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

