"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/Badge";

interface RolePermissionMapping {
  role: string;
  permissions: string[];
}

interface UserRoleView {
  userId: string;
  email: string;
  name: string | null;
  role: string | null;
  permissions: string[];
}

export default function AdminRbacPage() {
  const [matrix, setMatrix] = useState<RolePermissionMapping[]>([]);
  const [userViews, setUserViews] = useState<UserRoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matrix" | "users">("matrix");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matrixRes, usersRes] = await Promise.all([
        fetch("/api/admin/rbac/matrix"),
        fetch("/api/admin/rbac/tenant-users"),
      ]);

      const matrixData = await matrixRes.json();
      const usersData = await usersRes.json();

      if (matrixData.ok) {
        setMatrix(matrixData.matrix || []);
      }
      if (usersData.ok) {
        setUserViews(usersData.views || []);
      }
    } catch (err) {
      console.error("Failed to load RBAC data:", err);
    } finally {
      setLoading(false);
    }
  };

  const matrixColumns: Column<RolePermissionMapping>[] = [
    {
      key: "role",
      header: "Role",
      sortable: true,
      accessor: (row) => {
        const roleUpper = row.role.toUpperCase();
        if (roleUpper === "SUPER_ADMIN") return <Badge variant="danger">{row.role}</Badge>;
        if (roleUpper === "ADMIN") return <Badge variant="warning">{row.role}</Badge>;
        if (roleUpper === "MANAGER") return <Badge variant="info">{row.role}</Badge>;
        if (roleUpper === "STAFF") return <Badge variant="success">{row.role}</Badge>;
        return <Badge>{row.role}</Badge>;
      },
    },
    {
      key: "permissions",
      header: "Permissions",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.length === 0 ? (
            <span className="text-nexaMutedText">No permissions</span>
          ) : (
            row.permissions.map((perm) => (
              <Badge key={perm} variant="neutral" className="text-xs">
                {perm}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "count",
      header: "Count",
      accessor: (row) => row.permissions.length,
      hideOnMobile: true,
    },
  ];

  const userColumns: Column<UserRoleView>[] = [
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      accessor: (row) => row.name || "—",
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      accessor: (row) => {
        if (!row.role) return <Badge variant="neutral">—</Badge>;
        const roleUpper = row.role.toUpperCase();
        if (roleUpper === "SUPER_ADMIN") return <Badge variant="danger">{row.role}</Badge>;
        if (roleUpper === "ADMIN") return <Badge variant="warning">{row.role}</Badge>;
        if (roleUpper === "MANAGER") return <Badge variant="info">{row.role}</Badge>;
        if (roleUpper === "STAFF") return <Badge variant="success">{row.role}</Badge>;
        return <Badge>{row.role}</Badge>;
      },
    },
    {
      key: "permissions",
      header: "Permissions",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.length === 0 ? (
            <span className="text-nexaMutedText">No permissions</span>
          ) : (
            row.permissions.slice(0, 5).map((perm) => (
              <Badge key={perm} variant="neutral" className="text-xs">
                {perm}
              </Badge>
            ))
          )}
          {row.permissions.length > 5 && <Badge variant="neutral" className="text-xs">+{row.permissions.length - 5}</Badge>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="RBAC Management"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "RBAC" }]}
      />

      <main className="space-y-4 px-8 pb-24">
        <Card>
          <CardHeader title="Role-Based Access Control" />
          <CardContent>
            <div className="flex gap-4 mb-4 border-b">
              <button
                className={`px-4 py-2 font-medium ${activeTab === "matrix" ? "border-b-2 border-nexaPrimary text-nexaPrimary" : "text-nexaMutedText"}`}
                onClick={() => setActiveTab("matrix")}
              >
                Role → Permissions Matrix
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === "users" ? "border-b-2 border-nexaPrimary text-nexaPrimary" : "text-nexaMutedText"}`}
                onClick={() => setActiveTab("users")}
              >
                User Roles
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading RBAC data...</div>
            ) : activeTab === "matrix" ? (
              <DataTable
                columns={matrixColumns}
                data={matrix}
                searchable={true}
                searchPlaceholder="Search roles or permissions..."
                emptyMessage="No role mappings found"
              />
            ) : (
              <DataTable
                columns={userColumns}
                data={userViews}
                searchable={true}
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

