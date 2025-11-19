export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { CustomFieldsPanel } from "@/components/custom-fields/CustomFieldsPanel";
import EmployeesClient from "@/components/hr/EmployeesClient";

async function getEmployees() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/hr/employees/list`, { cache: "no-store" });
  if (!res.ok) return { employees: [] as any[] };
  return res.json();
}

type Employee = {
  id: string;
  empNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  createdAt: string;
};

export default async function EmployeesPage() {
  const { employees } = await getEmployees();

  const columns: Column<Employee>[] = [
    {
      key: "empNo",
      header: "Emp No",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      accessor: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      accessor: (row) => row.email || "—",
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
        title="HR — Employees"
        breadcrumb={[
          { label: "HR & Payroll", href: "/hr" },
          { label: "Employees" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Import
            </Button>
            <Button variant="primary" size="sm">
              New Employee
            </Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Note">
          Employee master (safe subset). Deactivate functionality is currently limited by the underlying data model and is read-only in this build.
        </Alert>

        <DataTable
          columns={columns}
          data={employees || []}
          searchable={true}
          searchPlaceholder="Search employees..."
          emptyMessage="No employees found"
        />

        <div className="mt-6">
          <EmployeesClient />
        </div>

        {/* Custom Fields Panel Demo - Would appear on detail/edit pages */}
        {employees && employees.length > 0 && (
          <div className="mt-6">
            <CustomFieldsPanel entityType="hr.employee" entityId={employees[0].id} mode="view" />
          </div>
        )}
      </main>
    </>
  );
}
