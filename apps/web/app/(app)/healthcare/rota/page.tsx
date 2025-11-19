"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type Rota = {
  id: string;
  practiceId?: string;
  practiceName?: string;
  startDate: string;
  endDate: string;
  status?: string;
};

type RotaListResult = {
  supported: boolean;
  rotas: Rota[];
  message?: string;
};

export default function HealthcareRotaPage() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const loadRotas = () => {
    setLoading(true);
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    fetch(`/api/healthcare/rota/list?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setRotas(data.data.rotas);
          if (!data.data.supported && data.data.message) {
            setMessage(data.data.message);
          } else {
            setMessage(null);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRotas();
  }, []);

  return (
    <Page title="Healthcare Rota">
      <div className="col-span-12 space-y-6">
        {message && (
          <div className="rounded-2xl border bg-yellow-50 p-6" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm text-yellow-800">{message}</div>
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Rota Management</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="text-sm font-medium block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={loadRotas}
            className="px-4 py-2 rounded-lg text-white mb-4"
            style={{ background: "var(--color-blue)" }}
          >
            Filter
          </button>

          {loading ? (
            <div>Loading...</div>
          ) : rotas.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              No rotas found. {message || "Schema gap: Rota management requires schema migration."}
            </div>
          ) : (
            <div className="space-y-2">
              {rotas.map((rota) => (
                <div key={rota.id} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="font-medium">
                    {rota.practiceName || `Rota ${rota.id}`} ({rota.status || "Unknown"})
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {new Date(rota.startDate).toLocaleDateString()} - {new Date(rota.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

