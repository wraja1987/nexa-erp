"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface AgentStep {
  id: string;
  runId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export default function AgentRunDetailPage() {
  const params = useParams();
  const runId = params.runId as string;
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (runId) {
      loadSteps();
    }
  }, [runId]);

  const loadSteps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent/console/steps?runId=${runId}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load steps");
        return;
      }

      setSupported(data.supported);
      setSteps(data.steps || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Agent Run: ${runId.slice(0, 8)}...`}
        breadcrumb={[
          { label: "AI", href: "/ai" },
          { label: "Agent Console", href: "/agent/overview" },
          { label: "Runs", href: "/agent/runs" },
          { label: runId.slice(0, 8) },
        ]}
      />

      <main className="space-y-4 px-8 pb-24">
        {!supported && (
          <Alert variant="warning" title="Schema Gap">
            Agent steps are not persisted (schema gap: no AgentStep model). Steps shown here are from transient correlation only.
          </Alert>
        )}

        {error && <Alert variant="danger" title="Error">{error}</Alert>}

        <Card>
          <CardHeader title="Run Steps" />
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading steps...</div>
            ) : steps.length === 0 ? (
              <div className="text-center py-8 text-nexaMutedText">
                {supported ? "No steps found" : "Steps are not persisted (schema gap)"}
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <Card key={step.id}>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="info">Step {idx + 1}</Badge>
                          <code className="text-sm font-mono">{step.toolName}</code>
                        </div>
                        {step.error && <Badge variant="danger">Error</Badge>}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Input:</span>
                          <pre className="mt-1 p-2 bg-nexaBgSecondary rounded text-xs overflow-auto">
                            {JSON.stringify(step.input, null, 2)}
                          </pre>
                        </div>
                        {step.output && (
                          <div>
                            <span className="font-medium">Output:</span>
                            <pre className="mt-1 p-2 bg-nexaBgSecondary rounded text-xs overflow-auto">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                          </div>
                        )}
                        {step.error && (
                          <div>
                            <span className="font-medium text-red-600">Error:</span>
                            <p className="mt-1 text-red-600">{step.error}</p>
                          </div>
                        )}
                        <div className="text-xs text-nexaMutedText">
                          Started: {new Date(step.startedAt).toLocaleString()}
                          {step.completedAt && ` • Completed: ${new Date(step.completedAt).toLocaleString()}`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

