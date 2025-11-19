export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";

async function getTransfers() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/inventory/transfers/list`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type Transfer = {
  id: string;
  at: string;
  action: string;
  target: string;
  data: any;
};

export default async function TransfersPage() {
  const rows = await getTransfers();

  const columns: Column<Transfer>[] = [
    {
      key: "at",
      header: "When",
      sortable: true,
      accessor: (row) => new Date(row.at).toLocaleString(),
    },
    {
      key: "action",
      header: "Action",
      sortable: true,
    },
    {
      key: "target",
      header: "Target",
      sortable: true,
    },
    {
      key: "data",
      header: "Data",
      sortable: false,
      hideOnMobile: true,
      accessor: (row) => (
        <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-auto max-w-xs">
          {JSON.stringify(row.data, null, 2)}
        </pre>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Inventory — Transfers"
        breadcrumb={[
          { label: "Inventory & WMS", href: "/inventory" },
          { label: "Transfers" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="primary" size="sm">
              New Transfer
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Note">
          Recent transfers (from AuditLog). Transfer functionality is available via API.
        </Alert>

        <DataTable
          columns={columns}
          data={rows}
          searchable={true}
          searchPlaceholder="Search transfers..."
          emptyMessage="No transfers recorded"
        />
      </main>
    </>
  );
}
