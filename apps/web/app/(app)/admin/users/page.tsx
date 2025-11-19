"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

interface TenantUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  active: boolean | null;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState("VIEWER");
  const [createSendInvite, setCreateSendInvite] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load users");
        return;
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          name: createName || undefined,
          role: createRole,
          sendInvite: createSendInvite,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to create user");
        return;
      }

      setShowCreateModal(false);
      setCreateEmail("");
      setCreateName("");
      setCreateRole("VIEWER");
      setCreateSendInvite(true);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateRole", role: newRole }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to update role");
        return;
      }

      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate" }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to deactivate user");
        return;
      }

      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to deactivate user");
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate" }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to reactivate user");
        return;
      }

      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to reactivate user");
    }
  };

  const handleTriggerPasswordReset = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "triggerPasswordReset" }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to trigger password reset");
        return;
      }

      alert("Password reset email sent (if SMTP is configured)");
    } catch (err: any) {
      setError(err.message || "Failed to trigger password reset");
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="neutral">—</Badge>;
    const roleUpper = role.toUpperCase();
    if (roleUpper === "SUPER_ADMIN") return <Badge variant="danger">Super Admin</Badge>;
    if (roleUpper === "ADMIN") return <Badge variant="warning">Admin</Badge>;
    if (roleUpper === "MANAGER") return <Badge variant="info">Manager</Badge>;
    if (roleUpper === "STAFF") return <Badge variant="success">Staff</Badge>;
    return <Badge>{role}</Badge>;
  };

  const columns: Column<TenantUser>[] = [
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
      accessor: (row) => getRoleBadge(row.role),
    },
    {
      key: "active",
      header: "Status",
      sortable: true,
      accessor: (row) => (row.active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      sortable: true,
      accessor: (row) => (row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : "Never"),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <select
            className="text-sm border rounded px-2 py-1"
            value={row.role || "VIEWER"}
            onChange={(e) => handleUpdateRole(row.id, e.target.value)}
          >
            <option value="VIEWER">Viewer</option>
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          {row.active ? (
            <Button variant="destructive" size="sm" onClick={() => handleDeactivate(row.id)}>
              Deactivate
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => handleReactivate(row.id)}>
              Reactivate
            </Button>
          )}
          <Button variant="subtle" size="sm" onClick={() => handleTriggerPasswordReset(row.id)}>
            Reset Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="User Management"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            Create User
          </Button>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        {error && <Alert variant="danger" title="Error">{error}</Alert>}

        {showCreateModal && (
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">Create User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendInvite"
                    checked={createSendInvite}
                    onChange={(e) => setCreateSendInvite(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="sendInvite" className="text-sm">
                    Send invite email (password reset)
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleCreateUser} disabled={!createEmail}>
                    Create
                  </Button>
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <DataTable
                columns={columns}
                data={users}
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

