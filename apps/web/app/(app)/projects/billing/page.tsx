"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Projects — Billing"
      subtitle="Manage billing."
      breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Billing", href: "/projects/billing" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Projects — Billing workspace.</p>
      </div>
    </NexaShell>
  );
}
