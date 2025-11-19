export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/Badge";
import { getDefaultDefinitions } from "@/server/customFields/registry";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import type { CustomFieldDefinition } from "@/server/customFields/types";

type Props = {
  params: { entityType: string };
};

export default async function CustomFieldsEntityPage({ params }: Props) {
  const { tenantId } = await assertTenantScope();
  const { entityType } = params;
  const definitions = getDefaultDefinitions(entityType);

  const columns: Column<CustomFieldDefinition>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "label",
      header: "Label",
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (row) => <Badge variant="info">{row.type}</Badge>,
    },
    {
      key: "required",
      header: "Required",
      sortable: true,
      accessor: (row) => (row.required ? <Badge variant="danger">Yes</Badge> : <span>—</span>),
    },
    {
      key: "visibility",
      header: "Visibility",
      sortable: false,
      hideOnMobile: true,
      accessor: (row) => (
        <div className="flex gap-1">
          {row.visibility?.map((v) => (
            <Badge key={v} variant="default" className="text-xs">
              {v}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "options",
      header: "Options",
      sortable: false,
      hideOnMobile: true,
      accessor: (row) => (row.options ? row.options.join(", ") : "—"),
    },
  ];

  return (
    <>
      <PageHeader
        title={`Custom Fields — ${entityType}`}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Custom Fields", href: "/admin/custom-fields" },
          { label: entityType },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="warning" title="Read-Only Definitions">
          Custom field definitions are currently code-based and cannot be edited. To add or modify definitions, update the registry in <code>apps/web/src/server/customFields/registry.ts</code>. Full CRUD support requires a CustomFieldDefinition table in the schema.
        </Alert>

        <Card>
          <CardHeader title={`Definitions — ${entityType}`} />
          <CardContent>
            <DataTable
              columns={columns}
              data={definitions}
              searchable={true}
              searchPlaceholder="Search definitions..."
              emptyMessage="No custom field definitions found"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

