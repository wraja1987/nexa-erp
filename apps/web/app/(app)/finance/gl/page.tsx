export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";
import { DataTable, type Column } from "@/components/table/DataTable";

async function getJournalEntries() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/finance/gl/journal-entries`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type JournalEntry = {
  id: string;
  date: string;
  description: string;
  debit: number | string;
  credit: number | string;
  accountCode: string;
};

export default async function GLPage() {
  const entries = await getJournalEntries();

  const columns: Column<JournalEntry>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      accessor: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
    },
    {
      key: "accountCode",
      header: "Account",
      sortable: true,
    },
    {
      key: "debit",
      header: "Debit",
      sortable: true,
      accessor: (row) => Number(row.debit ?? 0) > 0 ? `£${Number(row.debit ?? 0).toFixed(2)}` : "—",
    },
    {
      key: "credit",
      header: "Credit",
      sortable: true,
      accessor: (row) => Number(row.credit ?? 0) > 0 ? `£${Number(row.credit ?? 0).toFixed(2)}` : "—",
    },
  ];

  return (
    <>
      <PageHeader
        title="Finance — General Ledger"
        breadcrumb={[
          { label: "Finance", href: "/finance" },
          { label: "General Ledger" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Run Report
            </Button>
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button variant="primary" size="sm">
              New Entry
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Total Revenue" value="€405,280" trend="12.5%" />
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
          data={entries}
          searchable={true}
          searchPlaceholder="Search journal entries..."
          emptyMessage="No journal entries found"
        />
      </main>
    </>
  );
}
