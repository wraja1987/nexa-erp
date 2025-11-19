export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import type { WorkflowHistoryEntry } from "@/server/workflow/types";

type Props = {
  params: { entityType: string; entityId: string };
};

async function getWorkflowHistory(entityType: string, entityId: string, tenantId: string) {
  // For server components, we can call the history function directly
  const { listWorkflowHistory } = await import("@/server/workflow/history");
  return await listWorkflowHistory(entityType, entityId, tenantId);
}

export default async function WorkflowHistoryPage({ params }: Props) {
  const { tenantId } = await assertTenantScope();
  const { entityType, entityId } = params;
  const result = await getWorkflowHistory(entityType, entityId, tenantId);

  const columns: Column<WorkflowHistoryEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      accessor: (row) => new Date(row.timestamp).toLocaleString(),
    },
    {
      key: "fromState",
      header: "From",
      sortable: true,
    },
    {
      key: "toState",
      header: "To",
      sortable: true,
    },
    {
      key: "action",
      header: "Action",
      sortable: true,
    },
    {
      key: "actorId",
      header: "Actor",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "reason",
      header: "Reason",
      sortable: false,
      hideOnMobile: true,
      accessor: (row) => row.reason || "—",
    },
  ];

  return (
    <>
      <PageHeader
        title={`Workflow History — ${entityType}`}
        breadcrumb={[
          { label: "Workflow", href: "/workflow" },
          { label: "Overview", href: "/workflow/overview" },
          { label: entityType, href: `/workflow/entity/${entityType}` },
          { label: "History" },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        {result && !result.supported && (
          <Alert variant="warning" title="Schema Gap">
            {result.reason || "Workflow history is not fully persisted. Showing event-based history (best-effort)."}
          </Alert>
        )}

        <Card>
          <CardHeader title={`Workflow History — ${entityId}`} />
          <CardContent>
            <DataTable
              columns={columns}
              data={result?.entries || []}
              searchable={true}
              searchPlaceholder="Search history..."
              emptyMessage={result?.supported === false ? "History not available (schema gap)" : "No history found"}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

