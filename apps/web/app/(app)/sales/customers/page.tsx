"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Sales — Customers"
      subtitle="Manage customers."
      breadcrumbs={[{ label: "Sales", href: "/sales" }, { label: "Customers", href: "/sales/customers" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Sales — Customers workspace.</p>
      </div>
    </NexaShell>
  );
}
