"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Finance — Reconciliation"
      subtitle="Manage reconciliation."
      breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Reconciliation", href: "/finance/reconciliation" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Finance — Reconciliation workspace.</p>
      </div>
    </NexaShell>
  );
}
