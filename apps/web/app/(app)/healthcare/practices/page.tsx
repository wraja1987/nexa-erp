"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type Practice = {
  id: string;
  name: string;
  code?: string;
  address?: string;
  active?: boolean;
  pcnId?: string;
  pcnName?: string;
};

type PracticeListResult = {
  supported: boolean;
  practices: Practice[];
  message?: string;
};

export default function HealthcarePracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/healthcare/practices/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setPractices(data.data.practices);
          if (!data.data.supported && data.data.message) {
            setMessage(data.data.message);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page title="Healthcare Practices">
      <div className="col-span-12 space-y-6">
        {message && (
          <div className="rounded-2xl border bg-yellow-50 p-6" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm text-yellow-800">{message}</div>
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Practices</h2>
          {loading ? (
            <div>Loading...</div>
          ) : practices.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              No practices found. {message || "Schema gap: Practice management requires schema migration."}
            </div>
          ) : (
            <div className="space-y-2">
              {practices.map((p) => (
                <div key={p.id} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="font-medium">{p.name}</div>
                  {p.code && (
                    <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                      Code: {p.code}
                    </div>
                  )}
                  {p.pcnName && (
                    <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                      PCN: {p.pcnName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

