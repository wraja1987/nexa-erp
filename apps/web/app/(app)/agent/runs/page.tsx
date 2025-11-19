"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface AgentRun {
  id: string;
  tenantId: string;
  userId: string;
  goal: string;
  module?: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function AgentRunsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/console/runs");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load runs");
        return;
      }

      setSupported(data.supported);
      setRuns(data.runs || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") return <Badge variant="success">Completed</Badge>;
    if (status === "failed") return <Badge variant="danger">Failed</Badge>;
    return <Badge variant="info">Running</Badge>;
  };

  const columns: Column<AgentRun>[] = [
    {
      key: "goal",
      header: "Goal",
      sortable: true,
      accessor: (row) => (
        <Link href={`/agent/runs/${row.id}`} className="text-nexaPrimary hover:underline">
          {row.goal.slice(0, 60)}
          {row.goal.length > 60 ? "..." : ""}
        </Link>
      ),
    },
    {
      key: "module",
      header: "Module",
      sortable: true,
      accessor: (row) => (row.module ? <Badge variant="neutral">{row.module}</Badge> : "—"),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      key: "startedAt",
      header: "Started",
      sortable: true,
      accessor: (row) => new Date(row.startedAt).toLocaleString(),
      hideOnMobile: true,
    },
    {
      key: "completedAt",
      header: "Completed",
      sortable: true,
      accessor: (row) => (row.completedAt ? new Date(row.completedAt).toLocaleString() : "—"),
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Agent Runs"
        breadcrumb={[
          { label: "AI", href: "/ai" },
          { label: "Agent Console", href: "/agent/overview" },
          { label: "Runs" },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        {!supported && (
          <Alert variant="warning" title="Schema Gap">
            Agent run/step logging is not persisted (schema gap: no AgentRun/AgentStep models). Runs use transient IDs for correlation only.
          </Alert>
        )}

        {error && <Alert variant="danger" title="Error">{error}</Alert>}

        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading runs...</div>
            ) : (
              <DataTable
                columns={columns}
                data={runs}
                searchable={true}
                searchPlaceholder="Search runs..."
                emptyMessage={supported ? "No agent runs found" : "Agent runs are not persisted (schema gap)"}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

