export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import { InlineAiAction } from "@/components/ai/InlineAiAction";
import { DataTable, type Column } from "@/components/table/DataTable";

async function getWorkOrders() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/manufacturing/work-orders/list`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type WorkOrder = {
  id: string;
  number: string;
  itemCode: string;
  quantity: number | string;
  status: string;
  startPlanned?: string | null;
  endPlanned?: string | null;
};

export default async function WorkOrdersPage() {
  const workOrders = await getWorkOrders();

  const columns: Column<WorkOrder>[] = [
    {
      key: "number",
      header: "WO #",
      sortable: true,
    },
    {
      key: "itemCode",
      header: "Item",
      sortable: true,
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      accessor: (row) => Number(row.quantity ?? 0),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
    },
    {
      key: "startPlanned",
      header: "Start Planned",
      sortable: true,
      hideOnMobile: true,
      accessor: (row) => row.startPlanned ? new Date(row.startPlanned).toLocaleDateString() : "—",
    },
    {
      key: "endPlanned",
      header: "End Planned",
      sortable: true,
      hideOnMobile: true,
      accessor: (row) => row.endPlanned ? new Date(row.endPlanned).toLocaleDateString() : "—",
    },
  ];

  return (
    <>
      <PageHeader
        title="Manufacturing — Work Orders"
        breadcrumb={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Work Orders" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="primary" size="sm">
              New Work Order
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Open WOs" value="18" trend="1.2%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader title="AI Insights" />
            <CardContent>
              <p className="text-sm mb-3">Schedule bottleneck resources to reduce WO lead times.</p>
              <InlineAiAction
                label="Flag anomalies"
                onClick={async () => {
                  console.log("AI: Flag work order anomalies");
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm">New</Button>
                <Button variant="secondary" size="sm">BOMs</Button>
                <Button variant="secondary" size="sm">Routings</Button>
                <Button variant="secondary" size="sm">Resources</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={workOrders}
          searchable={true}
          searchPlaceholder="Search work orders by number, item..."
          emptyMessage="No work orders found"
        />
      </main>
    </>
  );
}
