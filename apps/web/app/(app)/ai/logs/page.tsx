"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Ai — Logs"
      subtitle="Manage logs."
      breadcrumbs={[{ label: "Ai", href: "/ai" }, { label: "Logs", href: "/ai/logs" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Ai — Logs workspace.</p>
      </div>
    </NexaShell>
  );
}
