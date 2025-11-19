export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import { InlineAiAction } from "@/components/ai/InlineAiAction";
import { DataTable, type Column } from "@/components/table/DataTable";
import { CustomFieldsPanel } from "@/components/custom-fields/CustomFieldsPanel";

async function getInvoices() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/finance/ar/invoices/list`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type Invoice = {
  id: string;
  number: string;
  customerId: string;
  total: number | string;
  status: string;
  issuedAt: string;
  dueAt?: string | null;
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const columns: Column<Invoice>[] = [
    {
      key: "number",
      header: "Invoice #",
      sortable: true,
    },
    {
      key: "customerId",
      header: "Customer",
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
        title="Finance — Invoices"
        breadcrumb={[
          { label: "Finance", href: "/finance" },
          { label: "Accounts Receivable", href: "/finance/ar" },
          { label: "Invoices" },
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
              New Invoice
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Revenue" value="€405,280" trend="12.5%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader title="AI Insights" />
            <CardContent>
              <p className="text-sm mb-3">Optimising labour costs could enhance your profit margins for the current quarter</p>
              <InlineAiAction
                label="Explain anomalies"
                onClick={async () => {
                  // AI action would call API here
                  console.log("AI: Explain invoice anomalies");
                }}
              />
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
          data={invoices}
          searchable={true}
          searchPlaceholder="Search invoices by number, customer..."
          emptyMessage="No invoices found"
        />

        {/* Custom Fields Panel Demo - Would appear on detail/edit pages */}
        {invoices && invoices.length > 0 && (
          <div className="mt-6">
            <CustomFieldsPanel entityType="finance.invoice" entityId={invoices[0].id} mode="view" />
          </div>
        )}
      </main>
    </>
  );
}
