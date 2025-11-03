"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Manufacturing — Resources"
      subtitle="Manage resources."
      breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Resources", href: "/manufacturing/resources" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Manufacturing — Resources workspace.</p>
      </div>
    </NexaShell>
  );
}
