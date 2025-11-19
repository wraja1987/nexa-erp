export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/Badge";
import { listSupportedEntityTypes, getDefaultDefinitions } from "@/server/customFields/registry";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import type { CustomFieldDefinition } from "@/server/customFields/types";

type EntityTypeInfo = {
  entityType: string;
  definitionsCount: number;
  definitions: CustomFieldDefinition[];
};

function getEntityTypes(tenantId: string): EntityTypeInfo[] {
  const entityTypes = listSupportedEntityTypes();
  return entityTypes.map((et) => {
    const definitions = getDefaultDefinitions(et);
    return {
      entityType: et,
      definitionsCount: definitions.length,
      definitions,
    };
  });
}

export default async function CustomFieldsAdminPage() {
  const { tenantId } = await assertTenantScope();
  const entityTypes = getEntityTypes(tenantId);

  const columns: Column<EntityTypeInfo>[] = [
    {
      key: "entityType",
      header: "Entity Type",
      sortable: true,
      accessor: (row) => (
        <a href={`/admin/custom-fields/${row.entityType}`} className="text-blue-600 hover:underline">
          {row.entityType}
        </a>
      ),
    },
    {
      key: "definitionsCount",
      header: "Fields",
      sortable: true,
      accessor: (row) => (
        <Badge variant={row.definitionsCount > 0 ? "success" : "default"}>
          {row.definitionsCount}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Custom Fields — Admin"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Custom Fields" },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Custom Fields Engine">
          Custom field definitions are currently code-based (read-only). Value storage is available for <code>finance.entity</code> entities only (via EntityExt.meta). Full persistence and editing require schema migration with CustomFieldDefinition and CustomFieldValue tables.
        </Alert>

        <Card>
          <CardHeader title="Entity Types" />
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

