export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/table/DataTable";
import { CustomFieldsPanel } from "@/components/custom-fields/CustomFieldsPanel";

async function getSuppliers() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/purchasing/suppliers/list`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type Supplier = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export default async function SuppliersPage() {
  const rows = await getSuppliers();

  const columns: Column<Supplier>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      accessor: (row) => row.email || "—",
      hideOnMobile: true,
    },
    {
      key: "phone",
      header: "Phone",
      sortable: true,
      accessor: (row) => row.phone || "—",
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Purchasing — Suppliers"
        breadcrumb={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Suppliers" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="primary" size="sm">
              New Supplier
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <DataTable
          columns={columns}
          data={rows}
          searchable={true}
          searchPlaceholder="Search suppliers by code, name..."
          emptyMessage="No suppliers found"
        />

        {/* Custom Fields Panel Demo - Would appear on detail/edit pages */}
        {rows && rows.length > 0 && (
          <div className="mt-6">
            <CustomFieldsPanel entityType="purchasing.supplier" entityId={rows[0].id} mode="view" />
          </div>
        )}
      </main>
    </>
  );
}
