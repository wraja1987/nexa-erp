export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import { DataTable, type Column } from "@/components/table/DataTable";

async function getBills() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/finance/ap/bills/list`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type Bill = {
  id: string;
  number: string;
  supplierId: string;
  total: number | string;
  status: string;
  issuedAt: string;
  dueAt?: string | null;
};

export default async function BillsPage() {
  const bills = await getBills();

  const columns: Column<Bill>[] = [
    {
      key: "number",
      header: "Bill #",
      sortable: true,
    },
    {
      key: "supplierId",
      header: "Supplier",
      sortable: true,
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      accessor: (row) => `£${Number(row.total ?? 0).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
    },
    {
      key: "issuedAt",
      header: "Issued",
      sortable: true,
      hideOnMobile: true,
      accessor: (row) => new Date(row.issuedAt).toLocaleDateString(),
    },
    {
      key: "dueAt",
      header: "Due",
      sortable: true,
      hideOnMobile: true,
      accessor: (row) => row.dueAt ? new Date(row.dueAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <>
      <PageHeader
        title="Finance — Bills"
        breadcrumb={[
          { label: "Finance", href: "/finance" },
          { label: "Accounts Payable", href: "/finance/ap" },
          { label: "Bills" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button variant="primary" size="sm">
              New Bill
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Total Bills" value="€405,280" trend="12.5%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader title="AI Insights" />
            <CardContent>
              <p className="text-sm">Optimising labour costs could enhance your profit margins for the current quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm">New</Button>
                <Button variant="secondary" size="sm">Report</Button>
                <Button variant="secondary" size="sm">Import</Button>
                <Button variant="secondary" size="sm">Export</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={bills}
          searchable={true}
          searchPlaceholder="Search bills by number, supplier..."
          emptyMessage="No bills found"
        />
      </main>
    </>
  );
}
