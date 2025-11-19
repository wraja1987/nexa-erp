"use client";

import { useState, useEffect } from "react";
import Page from "@/components/layout/Page";
import { ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/Button";

export default function CycleCountPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    loadPlans();
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      loadPlanLines(selectedPlan.id);
    }
  }, [selectedPlan]);

  async function loadPlans() {
    try {
      const res = await fetch("/api/inventory/cyclecount/list");
      const json = await res.json();
      if (json.ok) {
        setPlans(json.data || []);
      }
    } catch (e: any) {
      console.error("Failed to load plans:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadWarehouses() {
    try {
      const res = await fetch("/api/inventory/warehouses/list");
      const json = await res.json();
      if (json.ok) {
        setWarehouses(json.data || []);
      }
    } catch (e: any) {
      console.error("Failed to load warehouses:", e);
    }
  }

  async function loadPlanLines(planId: string) {
    try {
      // Note: Would need API endpoint for plan lines
      // For now, simplified
      setLines([]);
    } catch (e: any) {
      console.error("Failed to load plan lines:", e);
    }
  }

  async function createPlan() {
    if (!warehouses.length) {
      setError("No warehouses available");
      return;
    }
    const warehouseId = warehouses[0].id;
    const res = await fetch("/api/wms/cyclecount/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseId,
        name: `Cycle Count ${new Date().toLocaleDateString()}`,
        frequency: "monthly",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lines: [], // Would be populated from UI
      }),
    });
    const json = await res.json();
    if (json.ok) {
      await loadPlans();
      return json;
    }
    throw new Error(json.error || "Failed to create plan");
  }

  async function recordCount(lineId: string, countedQty: number) {
    const res = await fetch(`/api/wms/cyclecount/${lineId}/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countedQty }),
    });
    const json = await res.json();
    if (json.ok) {
      await loadPlanLines(selectedPlan.id);
      return json;
    }
    throw new Error(json.error || "Failed to record count");
  }

  async function approveVariance(lineId: string) {
    const res = await fetch(`/api/wms/cyclecount/${lineId}/approve`, {
      method: "POST",
    });
    const json = await res.json();
    if (json.ok) {
      await loadPlanLines(selectedPlan.id);
      return json;
    }
    throw new Error(json.error || "Failed to approve variance");
  }

  if (loading) {
    return (
      <Page title="Inventory • Cycle Counting">
        <div className="rounded-2xl border bg-white p-6">Loading…</div>
      </Page>
    );
  }

  return (
    <Page title="Inventory • Cycle Counting">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Cycle Count Plans</h3>
            <ActionButton
              label="Create Plan"
              onClick={createPlan}
              onSuccess={() => {}}
              variant="primary"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {plans.length > 0 ? (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-sm text-gray-600">
                    {plan.status} • {plan.frequency}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              No cycle count plans. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
