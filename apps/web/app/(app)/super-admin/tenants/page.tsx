"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface TenantSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "suspended" | "unknown";
  userCount: number;
  subscriptionCount: number;
  lastLoginAt: string | null;
}

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/superadmin/tenants");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load tenants");
        return;
      }

      setTenants(data.tenants || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="success">Active</Badge>;
    if (status === "suspended") return <Badge variant="danger">Suspended</Badge>;
    return <Badge variant="neutral">Unknown</Badge>;
  };

  const columns: Column<TenantSummary>[] = [
    {
      key: "name",
      header: "Tenant Name",
      sortable: true,
      accessor: (row) => (
        <Link href={`/super-admin/tenants/${row.id}`} className="text-nexaPrimary hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      key: "userCount",
      header: "Users",
      sortable: true,
    },
    {
      key: "subscriptionCount",
      header: "Subscriptions",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      sortable: true,
      accessor: (row) => (row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : "Never"),
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Super Admin — Tenants"
        breadcrumb={[{ label: "Super Admin", href: "/super-admin" }, { label: "Tenants" }]}
        actions={
          <button onClick={loadTenants} className="text-sm text-nexaPrimary hover:underline">
            Refresh
          </button>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Super Admin Portal">
          This portal provides read-only tenant management. Tenant suspension/activation requires schema changes (Tenant.status field).
        </Alert>

        {error && <Alert variant="danger" title="Error">{error}</Alert>}

        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading tenants...</div>
            ) : (
              <DataTable
                columns={columns}
                data={tenants}
                searchable={true}
                searchPlaceholder="Search tenants..."
                emptyMessage="No tenants found"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

