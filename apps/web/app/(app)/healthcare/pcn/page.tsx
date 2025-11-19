"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type Pcn = {
  id: string;
  name: string;
  practiceCount?: number;
};

type PcnListResult = {
  supported: boolean;
  pcns: Pcn[];
  message?: string;
};

export default function HealthcarePcnPage() {
  const [pcns, setPcns] = useState<Pcn[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/healthcare/pcn/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setPcns(data.data.pcns);
          if (!data.data.supported && data.data.message) {
            setMessage(data.data.message);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page title="PCN (Primary Care Networks)">
      <div className="col-span-12 space-y-6">
        {message && (
          <div className="rounded-2xl border bg-yellow-50 p-6" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm text-yellow-800">{message}</div>
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">PCNs</h2>
          {loading ? (
            <div>Loading...</div>
          ) : pcns.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              No PCNs found. {message || "Schema gap: PCN management requires schema migration."}
            </div>
          ) : (
            <div className="space-y-2">
              {pcns.map((pcn) => (
                <div key={pcn.id} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="font-medium">{pcn.name}</div>
                  {pcn.practiceCount !== undefined && (
                    <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                      Practices: {pcn.practiceCount}
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

