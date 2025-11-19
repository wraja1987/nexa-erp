"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { PlanRecommendation } from "@/server/planning/types";

export default function PlanningRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<PlanRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [horizonMonths, setHorizonMonths] = useState(3);
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  useEffect(() => {
    loadRecommendations();
  }, [horizonMonths, itemId, warehouseId]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        horizonMonths: String(horizonMonths),
      });
      if (itemId) params.set("itemId", itemId);
      if (warehouseId) params.set("warehouseId", warehouseId);

      const res = await fetch(`/api/planning/recommendations?${params}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSupported(false);
        setError(data.error || "Failed to load recommendations");
        return;
      }

      setRecommendations(data.recommendations || []);
      setSupported(data.supported !== false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setSupported(false);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: PlanRecommendation["type"]) => {
    switch (type) {
      case "purchase_order":
        return <Badge variant="info">PO</Badge>;
      case "work_order":
        return <Badge variant="success">WO</Badge>;
      case "transfer":
        return <Badge variant="warning">Transfer</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: PlanRecommendation["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Badge variant="success">High</Badge>;
      case "medium":
        return <Badge variant="info">Medium</Badge>;
      case "low":
        return <Badge variant="warning">Low</Badge>;
      default:
        return <Badge>{confidence}</Badge>;
    }
  };

  const columns: Column<PlanRecommendation>[] = [
    {
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (row) => getTypeBadge(row.type),
    },
    {
      key: "itemId",
      header: "Item",
      sortable: true,
    },
    {
      key: "warehouseId",
      header: "Warehouse",
      sortable: true,
      accessor: (row) => row.warehouseId || row.toWarehouseId || "—",
    },
    {
      key: "quantityMinor",
      header: "Quantity",
      sortable: true,
      accessor: (row) => row.quantityMinor.toLocaleString(),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
    },
    {
      key: "confidence",
      header: "Confidence",
      sortable: true,
      accessor: (row) => getConfidenceBadge(row.confidence),
      hideOnMobile: true,
    },
    {
      key: "reason",
      header: "Reason",
      accessor: (row) => row.reason,
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Planning Recommendations"
        breadcrumb={[{ label: "Planning", href: "/planning/overview" }, { label: "Recommendations" }]}
        actions={
          <Button variant="secondary" size="sm" onClick={loadRecommendations} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Suggested Actions">
          These are suggested actions based on net requirements. They are read-only suggestions and will not automatically create POs, WOs, or transfers.
        </Alert>

        {!supported && (
          <Alert variant="warning" title="Feature Not Fully Supported">
            {error || "Recommendations are not fully supported due to schema limitations."}
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
                  onChange={(e) => setHorizonMonths(parseInt(e.target.value) || 3)}
                  min={1}
                  max={12}
                />
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
              <div className="text-center py-8">Loading recommendations...</div>
            ) : error ? (
              <Alert variant="danger" title="Error">{error}</Alert>
            ) : (
              <DataTable
                columns={columns}
                data={recommendations}
                searchable={true}
                searchPlaceholder="Search recommendations..."
                emptyMessage="No recommendations found"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

