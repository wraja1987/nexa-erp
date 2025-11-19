export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { CustomFieldsPanel } from "@/components/custom-fields/CustomFieldsPanel";

async function getInventoryItems() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/inventory/items/list`, { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return json?.ok ? json.data : [];
}

type InventoryItem = {
  id: string;
  sku: string;
  warehouse?: { code: string };
  location?: { code: string };
  qtyOnHand: number | string;
};

export default async function InventoryItemsPage() {
  const rows = await getInventoryItems();

  const columns: Column<InventoryItem>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
    },
    {
      key: "warehouse",
      header: "Warehouse",
      sortable: true,
      accessor: (row) => row.warehouse?.code || "—",
    },
    {
      key: "location",
      header: "Bin",
      sortable: true,
      accessor: (row) => row.location?.code || "—",
    },
    {
      key: "qtyOnHand",
      header: "Qty on Hand",
      sortable: true,
      accessor: (row) => Number(row.qtyOnHand ?? 0),
    },
  ];

  return (
    <>
      <PageHeader
        title="Inventory — Items"
        breadcrumb={[
          { label: "Inventory & WMS", href: "/inventory" },
          { label: "Items" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="primary" size="sm">
              New Item
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Note">
          Item records (SKU at Warehouse/Bin). To change quantities, use Transfers/Receiving.
        </Alert>

        <DataTable
          columns={columns}
          data={rows}
          searchable={true}
          searchPlaceholder="Search items by SKU, warehouse..."
          emptyMessage="No items found"
        />

        {/* Custom Fields Panel Demo - Would appear on detail/edit pages */}
        {rows && rows.length > 0 && (
          <div className="mt-6">
            <CustomFieldsPanel entityType="inventory.item" entityId={rows[0].id} mode="view" />
          </div>
        )}
      </main>
    </>
  );
}
