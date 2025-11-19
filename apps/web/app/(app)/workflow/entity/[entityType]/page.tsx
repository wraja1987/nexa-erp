export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/table/DataTable";
import { getWorkflowDefinition } from "@/server/workflow/registry";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import type { WorkflowState, WorkflowTransition } from "@/server/workflow/types";

type Props = {
  params: { entityType: string };
};

async function getWorkflowData(entityType: string, tenantId: string) {
  // For server components, we can call the registry directly
  const { getWorkflowDefinition } = await import("@/server/workflow/registry");
  const { supported, def, reason } = getWorkflowDefinition(entityType, tenantId);
  
  if (!supported || !def) {
    return { ok: true, supported: false, reason };
  }

  return {
    ok: true,
    supported: true,
    definition: {
      entityType: def.entityType,
      states: def.states,
      transitions: def.transitions,
      initialState: def.initialState,
    },
    context: null, // Context requires entityId, which we don't have here
    availableActions: [],
  };
}

export default async function WorkflowEntityPage({ params }: Props) {
  const { tenantId } = await assertTenantScope();
  const { entityType } = params;
  const data = await getWorkflowData(entityType, tenantId);

  if (!data || !data.supported) {
    return (
      <>
        <PageHeader
          title={`Workflow — ${entityType}`}
          breadcrumb={[
            { label: "Workflow", href: "/workflow" },
            { label: "Overview", href: "/workflow/overview" },
            { label: entityType },
          ]}
        />
        <main className="space-y-4 px-8 pb-24">
          <Alert variant="warning" title="Not Supported">
            {data?.reason || "No workflow definition found for this entity type."}
          </Alert>
        </main>
      </>
    );
  }

  const def = data.definition;
  const states = def.states as WorkflowState[];
  const transitions = def.transitions as WorkflowTransition[];

  const stateColumns: Column<WorkflowState>[] = [
    {
      key: "id",
      header: "State ID",
      sortable: true,
    },
    {
      key: "label",
      header: "Label",
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      sortable: false,
      hideOnMobile: true,
    },
    {
      key: "isTerminal",
      header: "Terminal",
      sortable: true,
      accessor: (row) => (row.isTerminal ? <Badge variant="info">Terminal</Badge> : "—"),
    },
  ];

  const transitionColumns: Column<WorkflowTransition>[] = [
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
      key: "label",
      header: "Label",
      sortable: true,
    },
    {
      key: "conditions",
      header: "Conditions",
      sortable: false,
      hideOnMobile: true,
      accessor: (row) => (
        <div className="text-xs">
          {row.conditions.map((c, i) => (
            <div key={i} className="mb-1">
              {c.type === "role" && `Role: ${c.role}`}
              {c.type === "amount" && `Amount: ${c.operator} ${c.value}`}
              {c.type === "dimension" && `Dimension: ${c.dimension} = ${c.value}`}
              {c.type === "always" && "Always"}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`Workflow — ${entityType}`}
        breadcrumb={[
          { label: "Workflow", href: "/workflow" },
          { label: "Overview", href: "/workflow/overview" },
          { label: entityType },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        {data.context && (
          <Card>
            <CardHeader title="Current Context" />
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Current State:</span>{" "}
                  <Badge variant="info">{data.context.currentState}</Badge>
                </div>
                {data.context.amount !== undefined && (
                  <div>
                    <span className="font-semibold">Amount:</span> £{data.context.amount.toFixed(2)}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Actor Role:</span> {data.context.actorRole}
                </div>
              </div>
              {data.availableActions && data.availableActions.length > 0 && (
                <div className="mt-4">
                  <span className="font-semibold text-sm">Available Actions:</span>
                  <div className="flex gap-2 mt-2">
                    {data.availableActions.map((a) => (
                      <Badge key={a.action} variant="success">
                        {a.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title="States" />
          <CardContent>
            <DataTable
              columns={stateColumns}
              data={states}
              searchable={true}
              searchPlaceholder="Search states..."
              emptyMessage="No states found"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Transitions" />
          <CardContent>
            <DataTable
              columns={transitionColumns}
              data={transitions}
              searchable={true}
              searchPlaceholder="Search transitions..."
              emptyMessage="No transitions found"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

