"use client";

import { useState, useEffect } from "react";
import Page from "@/components/layout/Page";
import { ActionButton } from "@/components/ui/ActionButton";
import Link from "next/link";

export default function SalesQuotesPage() {
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
      const res = await fetch("/api/sales/quotes/list");
      const json = await res.json();
      if (json.ok) {
        setRows(json.data || []);
      } else {
        setError(json.error || "Failed to load quotes");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  async function sendQuote(quoteId: string) {
    const res = await fetch(`/api/sales/quotes/${quoteId}/send`, { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      await load();
      return json;
    }
    throw new Error(json.error || "Failed to send quote");
  }

  async function acceptQuote(quoteId: string) {
    const res = await fetch(`/api/sales/quotes/${quoteId}/accept`, { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      await load();
      return json;
    }
    throw new Error(json.error || "Failed to accept quote");
  }

  async function rejectQuote(quoteId: string) {
    const res = await fetch(`/api/sales/quotes/${quoteId}/reject`, { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      await load();
      return json;
    }
    throw new Error(json.error || "Failed to reject quote");
  }

  if (loading) {
    return (
      <Page title="Sales • Quotes">
        <div className="rounded-2xl border bg-white p-6">Loading…</div>
      </Page>
    );
  }

  return (
    <Page title="Sales • Quotes">
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
                  <th className="py-2 pr-4">Number</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pr-4">
                      <Link href={`/sales/quotes/${r.id}`} className="text-blue-600 hover:underline">
                        {r.number || r.id}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{r.status || "draft"}</td>
                    <td className="py-2 pr-4">£{Number(r.total || 0).toFixed(2)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        {r.status === "draft" && (
                          <ActionButton
                            label="Send"
                            onClick={() => sendQuote(r.id)}
                            onSuccess={() => {}}
                            variant="primary"
                          />
                        )}
                        {r.status === "sent" && (
                          <>
                            <ActionButton
                              label="Accept"
                              onClick={() => acceptQuote(r.id)}
                              onSuccess={() => {}}
                              variant="primary"
                            />
                            <ActionButton
                              label="Reject"
                              onClick={() => rejectQuote(r.id)}
                              onSuccess={() => {}}
                              variant="destructive"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            No quotes found.
          </div>
        )}
      </div>
    </Page>
  );
}
