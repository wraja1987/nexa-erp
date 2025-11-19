"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface AgentTool {
  name: string;
  module: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required?: string[];
  };
  readOnly: boolean;
}

export default function AgentOverviewPage() {
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runsSupported, setRunsSupported] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [toolsRes, runsRes] = await Promise.all([
        fetch("/api/agent/console/tools"),
        fetch("/api/agent/console/runs?limit=1"),
      ]);

      const toolsData = await toolsRes.json();
      const runsData = await runsRes.json();

      if (toolsData.ok) {
        setTools(toolsData.tools || []);
      } else {
        setError(toolsData.error || "Failed to load tools");
      }

      if (runsData.ok) {
        setRunsSupported(runsData.supported);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toolsByModule = tools.reduce((acc, tool) => {
    if (!acc[tool.module]) {
      acc[tool.module] = [];
    }
    acc[tool.module].push(tool);
    return acc;
  }, {} as Record<string, AgentTool[]>);

  return (
    <>
      <PageHeader
        title="Agent Console"
        breadcrumb={[{ label: "AI", href: "/ai" }, { label: "Agent Console" }]}
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Read-Only Agent Mode">
          All agent tools are read-only. No data modifications are possible through the agent layer.
        </Alert>

        {!runsSupported && (
          <Alert variant="warning" title="Schema Gap">
            Agent run/step logging is not persisted (schema gap: no AgentRun/AgentStep models). Runs use transient IDs for correlation only.
          </Alert>
        )}

        {error && <Alert variant="danger" title="Error">{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Available Tools" />
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading tools...</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(toolsByModule).map(([module, moduleTools]) => (
                    <div key={module}>
                      <h3 className="font-semibold mb-2 capitalize">{module}</h3>
                      <ul className="space-y-1">
                        {moduleTools.map((tool) => (
                          <li key={tool.name} className="text-sm">
                            <code className="text-nexaPrimary">{tool.name}</code>
                            <span className="text-nexaMutedText ml-2">— {tool.description}</span>
                            {tool.readOnly && <Badge variant="success" className="ml-2 text-xs">Read-Only</Badge>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent>
              <div className="space-y-2">
                <Link href="/agent/runs" className="block text-nexaPrimary hover:underline">
                  View Agent Runs
                </Link>
                {!runsSupported && (
                  <p className="text-xs text-nexaMutedText">
                    (Runs not persisted due to schema gap)
                  </p>
                )}
                <Link href="/ai" className="block text-nexaPrimary hover:underline">
                  AI Engine
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

