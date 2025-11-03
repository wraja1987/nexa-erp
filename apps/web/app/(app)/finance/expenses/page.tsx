"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Finance — Expenses"
      subtitle="Manage expenses."
      breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Expenses", href: "/finance/expenses" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Finance — Expenses workspace.</p>
      </div>
    </NexaShell>
  );
}
