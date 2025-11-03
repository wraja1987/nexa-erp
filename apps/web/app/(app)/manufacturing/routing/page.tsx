"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Manufacturing — Routing"
      subtitle="Manage routing."
      breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Routing", href: "/manufacturing/routing" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Manufacturing — Routing workspace.</p>
      </div>
    </NexaShell>
  );
}
