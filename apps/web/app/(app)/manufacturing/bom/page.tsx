"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Manufacturing — Bom"
      subtitle="Manage bom."
      breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Bom", href: "/manufacturing/bom" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Manufacturing — Bom workspace.</p>
      </div>
    </NexaShell>
  );
}
