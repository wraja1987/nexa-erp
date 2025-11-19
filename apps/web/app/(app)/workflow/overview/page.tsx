export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/Badge";
import { listSupportedEntityTypes, getWorkflowDefinition } from "@/server/workflow/registry";
import { assertTenantScope } from "@/lib/auth/tenant.server";

type EntityTypeInfo = {
  entityType: string;
  supported: boolean;
  reason?: string;
  statesCount?: number;
  transitionsCount?: number;
};

function getEntityTypes(tenantId: string): EntityTypeInfo[] {
  const entityTypes = listSupportedEntityTypes();
  return entityTypes.map((et) => {
    const { supported, def, reason } = getWorkflowDefinition(et, tenantId);
    return {
      entityType: et,
      supported,
      reason,
      statesCount: def?.states.length,
      transitionsCount: def?.transitions.length,
    };
  });
}

export default async function WorkflowOverviewPage() {
  const { tenantId } = await assertTenantScope();
  const entityTypes = getEntityTypes(tenantId);

  const columns: Column<EntityTypeInfo>[] = [
    {
      key: "entityType",
      header: "Entity Type",
      sortable: true,
      accessor: (row) => (
        <a href={`/workflow/entity/${row.entityType}`} className="text-blue-600 hover:underline">
          {row.entityType}
        </a>
      ),
    },
    {
      key: "supported",
      header: "Status",
      sortable: true,
      accessor: (row) =>
        row.supported ? (
          <Badge variant="success">Supported</Badge>
        ) : (
          <Badge variant="default">Not Supported</Badge>
        ),
    },
    {
      key: "statesCount",
      header: "States",
      sortable: true,
      accessor: (row) => row.statesCount || "—",
    },
    {
      key: "transitionsCount",
      header: "Transitions",
      sortable: true,
      accessor: (row) => row.transitionsCount || "—",
    },
    {
      key: "reason",
      header: "Notes",
      sortable: false,
      hideOnMobile: true,
      accessor: (row) => row.reason || "—",
    },
  ];

  return (
    <>
      <PageHeader
        title="Workflow — Overview"
        breadcrumb={[
          { label: "Workflow", href: "/workflow" },
          { label: "Overview" },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Workflow Engine">
          The workflow engine enforces policy-based transitions for supported entity types. Workflow definitions are currently code-based. History is event-based (via AuditLog) until WorkflowHistory table is added to the schema.
        </Alert>

        <Card>
          <CardHeader title="Supported Entity Types" />
          <CardContent>
            <DataTable
              columns={columns}
              data={entityTypes}
              searchable={true}
              searchPlaceholder="Search entity types..."
              emptyMessage="No entity types found"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

