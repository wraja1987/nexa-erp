"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface SupportContext {
  superAdminUserId: string;
  targetTenantId: string;
  targetUserId: string;
  effectiveTenantId: string;
  effectiveRoles: string[];
  isReadOnly: true;
}

export default function SuperAdminSupportPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [context, setContext] = useState<SupportContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState("");

  useEffect(() => {
    // In a real implementation, we'd fetch available users for the tenant
    // For now, this is a placeholder
  }, [tenantId]);

  const handleOpenSupportView = async () => {
    if (!targetUserId) {
      setError("Please select a user");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/support/impersonation/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, userId: targetUserId }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to open support view");
        return;
      }

      setContext(data.context);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Support View (Read-Only)"
        breadcrumb={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Tenants", href: "/super-admin/tenants" },
          { label: tenantId, href: `/super-admin/tenants/${tenantId}` },
          { label: "Support View" },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="warning" title="READ-ONLY SUPPORT MODE">
          This is a read-only support view. You are viewing tenant data as a support user. No write operations are allowed.
        </Alert>

        {error && <Alert variant="danger" title="Error">{error}</Alert>}

        {!context ? (
          <Card>
            <CardHeader title="Open Support View" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target User ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter user ID to view as"
                  />
                </div>
                <Button variant="primary" onClick={handleOpenSupportView} disabled={loading || !targetUserId}>
                  {loading ? "Opening..." : "Open Support View"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader title="Support Context Active" />
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Target Tenant</dt>
                  <dd className="text-sm">{context.targetTenantId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Target User</dt>
                  <dd className="text-sm">{context.targetUserId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Effective Roles</dt>
                  <dd>
                    <div className="flex gap-1 mt-1">
                      {context.effectiveRoles.map((role) => (
                        <Badge key={role} variant="info">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-nexaMutedText">Mode</dt>
                  <dd>
                    <Badge variant="warning">Read-Only</Badge>
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => setContext(null)}>
                  Close Support View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

