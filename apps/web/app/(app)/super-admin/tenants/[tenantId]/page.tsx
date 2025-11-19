"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface TenantDetail {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "suspended" | "unknown";
  userCount: number;
  subscriptionCount: number;
  lastLoginAt: string | null;
  byokStatus: {
    enabled: boolean;
    provider: string;
    supported: boolean;
    reason?: string;
  };
  dataResidencyStatus: {
    region: string;
    supported: boolean;
    reason?: string;
  };
}

interface TenantUsageMetrics {
  tenantId: string;
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
  };
  modules: {
    invoices: number;
    purchaseOrders: number;
    workOrders: number;
    employees: number;
    inventoryItems: number;
    customers: number;
  };
  lastActivityAt: string | null;
}

export default function SuperAdminTenantDetailPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [metrics, setMetrics] = useState<TenantUsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspendSupported, setSuspendSupported] = useState(false);

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, metricsRes] = await Promise.all([
        fetch(`/api/admin/superadmin/tenants/${tenantId}`),
        fetch(`/api/admin/superadmin/tenants/${tenantId}/usage`),
      ]);

      const detailData = await detailRes.json();
      const metricsData = await metricsRes.json();

      if (detailData.ok) {
        setDetail(detailData.tenant);
      } else {
        setError(detailData.error || "Failed to load tenant detail");
      }

      if (metricsData.ok) {
        setMetrics(metricsData.metrics);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm("Are you sure you want to suspend this tenant?")) return;

    try {
      const res = await fetch(`/api/admin/superadmin/tenants/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 501) {
          setSuspendSupported(false);
          alert(data.error || "Tenant suspension is not supported (schema gap)");
        } else {
          setError(data.error || "Failed to suspend tenant");
        }
        return;
      }

      setSuspendSupported(true);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to suspend tenant");
    }
  };

  const handleActivate = async () => {
    if (!confirm("Are you sure you want to activate this tenant?")) return;

    try {
      const res = await fetch(`/api/admin/superadmin/tenants/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate" }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 501) {
          setSuspendSupported(false);
          alert(data.error || "Tenant activation is not supported (schema gap)");
        } else {
          setError(data.error || "Failed to activate tenant");
        }
        return;
      }

      setSuspendSupported(true);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to activate tenant");
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Loading..." breadcrumb={[{ label: "Super Admin", href: "/super-admin" }, { label: "Tenants" }, { label: "..." }]} />
        <main className="px-8 pb-24">
          <div className="text-center py-8">Loading tenant details...</div>
        </main>
      </>
    );
  }

  if (error || !detail) {
    return (
      <>
        <PageHeader title="Error" breadcrumb={[{ label: "Super Admin", href: "/super-admin" }, { label: "Tenants" }, { label: tenantId }]} />
        <main className="px-8 pb-24">
          <Alert variant="danger" title="Error">{error || "Tenant not found"}</Alert>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Tenant: ${detail.name}`}
        breadcrumb={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Tenants", href: "/super-admin/tenants" },
          { label: detail.name },
        ]}
        actions={
          <>
            <Link href={`/super-admin/support/${detail.id}`}>
              <Button variant="secondary" size="sm">
                Open Support View
              </Button>
            </Link>
            {detail.status === "active" ? (
              <Button variant="destructive" size="sm" onClick={handleSuspend} disabled={!suspendSupported && detail.status !== "suspended"}>
                Suspend Tenant
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleActivate} disabled={!suspendSupported && detail.status !== "active"}>
                Activate Tenant
              </Button>
            )}
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        {detail.status === "unknown" && (
          <Alert variant="warning" title="Schema Gap">
            Tenant status cannot be determined (Tenant.status field missing). Suspension/activation is not supported.
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Tenant Information" />
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">ID</dt>
                  <dd className="text-sm">{detail.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Name</dt>
                  <dd className="text-sm">{detail.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Status</dt>
                  <dd>
                    {detail.status === "active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : detail.status === "suspended" ? (
                      <Badge variant="danger">Suspended</Badge>
                    ) : (
                      <Badge variant="neutral">Unknown</Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Created</dt>
                  <dd className="text-sm">{new Date(detail.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Users</dt>
                  <dd className="text-sm">{detail.userCount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Subscriptions</dt>
                  <dd className="text-sm">{detail.subscriptionCount}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Security & Compliance" />
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">BYOK Enabled</dt>
                  <dd>
                    {detail.byokStatus.enabled ? (
                      <Badge variant="success">Yes ({detail.byokStatus.provider})</Badge>
                    ) : (
                      <Badge variant="neutral">No</Badge>
                    )}
                  </dd>
                </div>
                {!detail.byokStatus.supported && detail.byokStatus.reason && (
                  <div>
                    <dt className="text-sm font-medium text-nexaMutedText">BYOK Status</dt>
                    <dd className="text-xs text-nexaMutedText">{detail.byokStatus.reason}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Data Region</dt>
                  <dd>
                    {detail.dataResidencyStatus.supported ? (
                      <Badge variant="info">{detail.dataResidencyStatus.region}</Badge>
                    ) : (
                      <Badge variant="neutral">{detail.dataResidencyStatus.region}</Badge>
                    )}
                  </dd>
                </div>
                {!detail.dataResidencyStatus.supported && detail.dataResidencyStatus.reason && (
                  <div>
                    <dt className="text-sm font-medium text-nexaMutedText">Residency Status</dt>
                    <dd className="text-xs text-nexaMutedText">{detail.dataResidencyStatus.reason}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {metrics && (
          <Card>
            <CardHeader title="Usage Metrics" />
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{metrics.users.total}</div>
                  <div className="text-sm text-nexaMutedText">Total Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.users.active}</div>
                  <div className="text-sm text-nexaMutedText">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.subscriptions.active}</div>
                  <div className="text-sm text-nexaMutedText">Active Subscriptions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.modules.invoices}</div>
                  <div className="text-sm text-nexaMutedText">Invoices</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.modules.purchaseOrders}</div>
                  <div className="text-sm text-nexaMutedText">Purchase Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.modules.workOrders}</div>
                  <div className="text-sm text-nexaMutedText">Work Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.modules.employees}</div>
                  <div className="text-sm text-nexaMutedText">Employees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.modules.inventoryItems}</div>
                  <div className="text-sm text-nexaMutedText">Inventory Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

