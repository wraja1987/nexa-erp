"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Ai — Workbench"
      subtitle="Manage workbench."
      breadcrumbs={[{ label: "Ai", href: "/ai" }, { label: "Workbench", href: "/ai/workbench" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Ai — Workbench workspace.</p>
      </div>
    </NexaShell>
  );
}
