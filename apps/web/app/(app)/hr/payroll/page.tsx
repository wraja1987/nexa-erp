export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";

async function getRuns() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/hr/payroll/runs/list`, { cache: "no-store" });
  if (!res.ok) return { runs: [] as any[] };
  return res.json();
}

type PayrollRun = {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  createdAt: string;
};

export default async function PayrollPage() {
  const { runs } = await getRuns();

  const columns: Column<PayrollRun>[] = [
    {
      key: "period",
      header: "Period",
      sortable: true,
      accessor: (row) => `${new Date(row.periodStart).toLocaleDateString()} → ${new Date(row.periodEnd).toLocaleDateString()}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      hideOnMobile: true,
      accessor: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <>
      <PageHeader
        title="HR — Payroll"
        breadcrumb={[
          { label: "HR & Payroll", href: "/hr" },
          { label: "Payroll" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="primary" size="sm">
              New Pay Run
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Note">
          Build/Commit pay runs via APIs. HMRC export available as scaffolding under HR → HMRC (no live submission).
        </Alert>

        <DataTable
          columns={columns}
          data={runs || []}
          searchable={true}
          searchPlaceholder="Search payroll runs..."
          emptyMessage="No payroll runs found"
        />
      </main>
    </>
  );
}

