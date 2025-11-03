"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Pos — Sessions"
      subtitle="Manage sessions."
      breadcrumbs={[{ label: "Pos", href: "/pos" }, { label: "Sessions", href: "/pos/sessions" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Pos — Sessions workspace.</p>
      </div>
    </NexaShell>
  );
}
