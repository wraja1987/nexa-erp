"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Ai — Automations"
      subtitle="Manage automations."
      breadcrumbs={[{ label: "Ai", href: "/ai" }, { label: "Automations", href: "/ai/automations" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Ai — Automations workspace.</p>
      </div>
    </NexaShell>
  );
}
