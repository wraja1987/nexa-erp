"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CapacityView } from "@/server/planning/types";

export default function CapacityPlanningPage() {
  const [views, setViews] = useState<CapacityView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [horizonMonths, setHorizonMonths] = useState(1);
  const [bucketSize, setBucketSize] = useState<"week" | "month">("week");
  const [resourceCode, setResourceCode] = useState("");

  useEffect(() => {
    loadCapacityView();
  }, [horizonMonths, bucketSize, resourceCode]);

  const loadCapacityView = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        horizonMonths: String(horizonMonths),
        bucket: bucketSize,
      });
      if (resourceCode) params.set("resourceCode", resourceCode);

      const res = await fetch(`/api/planning/capacity?${params}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSupported(false);
        setError(data.error || "Failed to load capacity view");
        return;
      }

      setViews(data.views || []);
      setSupported(data.supported !== false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setSupported(false);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 90) return <Badge variant="danger">{utilization.toFixed(1)}%</Badge>;
    if (utilization >= 70) return <Badge variant="warning">{utilization.toFixed(1)}%</Badge>;
    return <Badge variant="success">{utilization.toFixed(1)}%</Badge>;
  };

  const columns: Column<CapacityView>[] = [
    {
      key: "resourceCode",
      header: "Resource",
      sortable: true,
    },
    {
      key: "bucket",
      header: "Time Bucket",
      sortable: true,
      accessor: (row) => row.bucket.label || `${row.bucket.start} to ${row.bucket.end}`,
    },
    {
      key: "availableMins",
      header: "Available (mins)",
      sortable: true,
      accessor: (row) => row.availableMins.toLocaleString(),
      hideOnMobile: true,
    },
    {
      key: "allocatedMins",
      header: "Allocated (mins)",
      sortable: true,
      accessor: (row) => row.allocatedMins.toLocaleString(),
      hideOnMobile: true,
    },
    {
      key: "utilizationPercent",
      header: "Utilization",
      sortable: true,
      accessor: (row) => getUtilizationBadge(row.utilizationPercent),
    },
    {
      key: "workOrders",
      header: "Work Orders",
      accessor: (row) => row.workOrders.length,
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Capacity Planning"
        breadcrumb={[{ label: "Planning", href: "/planning/overview" }, { label: "Capacity" }]}
        actions={
          <Button variant="secondary" size="sm" onClick={loadCapacityView} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        {!supported && (
          <Alert variant="warning" title="Feature Not Fully Supported">
            {error || "Capacity view is not fully supported due to schema limitations."}
          </Alert>
        )}

        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Horizon (months)</label>
                <Input
                  type="number"
                  value={horizonMonths}
                  onChange={(e) => setHorizonMonths(parseInt(e.target.value) || 1)}
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
                <label className="block text-sm font-medium mb-1">Resource Code (optional)</label>
                <Input
                  type="text"
                  value={resourceCode}
                  onChange={(e) => setResourceCode(e.target.value)}
                  placeholder="Filter by resource"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading capacity view...</div>
            ) : error ? (
              <Alert variant="danger" title="Error">{error}</Alert>
            ) : (
              <DataTable
                columns={columns}
                data={views}
                searchable={true}
                searchPlaceholder="Search capacity views..."
                emptyMessage="No capacity views found"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

