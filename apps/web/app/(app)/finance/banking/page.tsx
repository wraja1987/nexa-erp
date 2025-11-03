"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Finance — Banking"
      subtitle="Manage banking."
      breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Banking", href: "/finance/banking" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Finance — Banking workspace.</p>
      </div>
    </NexaShell>
  );
}
