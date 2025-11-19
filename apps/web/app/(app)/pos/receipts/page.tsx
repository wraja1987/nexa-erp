"use client";

import { useState, useEffect } from "react";
import Page from "@/components/layout/Page";
import { ActionButton } from "@/components/ui/ActionButton";
import KpiCard from "@/components/ui/KpiCard";

export default function PosReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pos/receipts/list");
      const json = await res.json();
      if (json.ok) {
        setReceipts(json.data || []);
      }
    } catch (e: any) {
      console.error("Failed to load receipts:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createRefund(saleId: string) {
    // Get sale lines for refund
    const sale = receipts.find((r) => r.id === saleId);
    if (!sale || !sale.lines) {
      throw new Error("Sale not found or has no lines");
    }

    // Refund all lines (simplified - in real UI would allow selection)
    const lines = sale.lines.map((line: any) => ({
      lineId: line.id,
      qty: Number(line.qty || 0),
    }));

    const res = await fetch("/api/pos/refunds/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saleId,
        reason: "Customer return",
        lines,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      await load();
      return json;
    }
    throw new Error(json.error || "Failed to create refund");
  }

  if (loading) {
    return (
      <Page title="POS • Receipts">
        <div className="rounded-2xl border bg-white p-6">Loading…</div>
      </Page>
    );
  }

  const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.total || 0), 0);

  return (
    <Page title="POS • Receipts">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <KpiCard title="Total Revenue" value={`£${totalRevenue.toFixed(2)}`} />
        </div>
        <div className="col-span-12 md:col-span-8 bg-white border border-nexa-border rounded-2xl p-5 shadow-card">
          <h3 className="font-medium mb-4">Recent Receipts</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}
          {receipts?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Sale Number</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 pr-4">{r.saleNumber || r.id}</td>
                      <td className="py-2 pr-4">£{Number(r.total || 0).toFixed(2)}</td>
                      <td className="py-2 pr-4">{r.status || "paid"}</td>
                      <td className="py-2 pr-4">
                        {r.status === "paid" && (
                          <ActionButton
                            label="Refund"
                            onClick={() => createRefund(r.id)}
                            onSuccess={() => {
                              setError(null);
                            }}
                            onError={(err) => setError(err)}
                            variant="destructive"
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
              No receipts found.
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
