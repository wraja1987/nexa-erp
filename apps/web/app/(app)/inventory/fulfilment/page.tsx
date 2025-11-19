"use client";

import { useState, useEffect } from "react";
import Page from "@/components/layout/Page";
import { ActionButton } from "@/components/ui/ActionButton";

export default function FulfilmentPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory/fulfilment/list-pickable");
      const json = await res.json();
      if (json.ok) {
        setTasks(json.data || []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function completePick(taskId: string, qty: number) {
    const res = await fetch(`/api/wms/pick/${taskId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qtyPicked: qty }),
    });
    const json = await res.json();
    if (json.ok) {
      await load();
      return json;
    }
    throw new Error(json.error || "Failed to complete pick");
  }

  if (loading) {
    return (
      <Page title="Inventory • Fulfilment (Pick/Pack/Ship)">
        <div className="rounded-2xl border bg-white p-6">Loading…</div>
      </Page>
    );
  }

  return (
    <Page title="Inventory • Fulfilment (Pick/Pack/Ship)">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">From</th>
                <th className="py-2 pr-4">To</th>
                <th className="py-2 pr-4">Wave</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t: any) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2 pr-4">{t.sku}</td>
                  <td className="py-2 pr-4">{Number(t.qty || 0)}</td>
                  <td className="py-2 pr-4">{t.fromLoc?.code || "—"}</td>
                  <td className="py-2 pr-4">{t.toLoc?.code || "—"}</td>
                  <td className="py-2 pr-4">{t.wave?.number || "—"}</td>
                  <td className="py-2 pr-4">{t.status}</td>
                  <td className="py-2 pr-4">
                    {t.status === "queued" && (
                      <ActionButton
                        label="Complete Pick"
                        onClick={() => completePick(t.id, Number(t.qty || 0))}
                        onSuccess={() => {}}
                        variant="primary"
                      />
                    )}
                  </td>
                </tr>
              ))}
              {!tasks?.length && (
                <tr>
                  <td colSpan={7} className="py-6 text-sm text-center" style={{ color: "var(--color-muted)" }}>
                    No queued pick tasks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}
