"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SupplyPlan } from "@/server/planning/types";

export default function SupplyPlanningPage() {
  const [plans, setPlans] = useState<SupplyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [horizonMonths, setHorizonMonths] = useState(3);
  const [bucketSize, setBucketSize] = useState<"week" | "month">("month");
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  useEffect(() => {
    loadSupplyPlan();
  }, [horizonMonths, bucketSize, itemId, warehouseId]);

  const loadSupplyPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        horizonMonths: String(horizonMonths),
        bucket: bucketSize,
      });
      if (itemId) params.set("itemId", itemId);
      if (warehouseId) params.set("warehouseId", warehouseId);

      const res = await fetch(`/api/planning/supply?${params}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSupported(false);
        setError(data.error || "Failed to load supply plan");
        return;
      }

      setPlans(data.plans || []);
      setSupported(data.supported !== false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setSupported(false);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<SupplyPlan>[] = [
    {
      key: "itemId",
      header: "Item",
      sortable: true,
    },
    {
      key: "warehouseId",
      header: "Warehouse",
      sortable: true,
      accessor: (row) => row.warehouseId || "—",
    },
    {
      key: "bucket",
      header: "Time Bucket",
      sortable: true,
      accessor: (row) => row.bucket.label || `${row.bucket.start} to ${row.bucket.end}`,
    },
    {
      key: "onHand",
      header: "On Hand",
      sortable: true,
      accessor: (row) => row.onHand.toLocaleString(),
    },
    {
      key: "openPO",
      header: "Open PO",
      sortable: true,
      accessor: (row) => row.openPO.toLocaleString(),
      hideOnMobile: true,
    },
    {
      key: "openWO",
      header: "Open WO",
      sortable: true,
      accessor: (row) => row.openWO.toLocaleString(),
      hideOnMobile: true,
    },
    {
      key: "totalSupply",
      header: "Total Supply",
      sortable: true,
      accessor: (row) => row.totalSupply.toLocaleString(),
    },
    {
      key: "safetyStock",
      header: "Safety Stock",
      sortable: true,
      accessor: (row) => (row.safetyStock || 0).toLocaleString(),
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Supply Planning"
        breadcrumb={[{ label: "Planning", href: "/planning/overview" }, { label: "Supply" }]}
        actions={
          <Button variant="secondary" size="sm" onClick={loadSupplyPlan} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        {!supported && (
          <Alert variant="warning" title="Feature Not Fully Supported">
            {error || "Supply planning is not fully supported due to schema limitations."}
          </Alert>
        )}

        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Horizon (months)</label>
                <Input
                  type="number"
                  value={horizonMonths}
                  onChange={(e) => setHorizonMonths(parseInt(e.target.value) || 3)}
                  min={1}
                  max={12}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bucket Size</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={bucketSize}
                  onChange={(e) => setBucketSize(e.target.value as "week" | "month")}
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Item ID (optional)</label>
                <Input
                  type="text"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  placeholder="Filter by item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Warehouse ID (optional)</label>
                <Input
                  type="text"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  placeholder="Filter by warehouse"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading supply plan...</div>
            ) : error ? (
              <Alert variant="danger" title="Error">{error}</Alert>
            ) : (
              <DataTable
                columns={columns}
                data={plans}
                searchable={true}
                searchPlaceholder="Search supply plans..."
                emptyMessage="No supply plans found"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

