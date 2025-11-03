"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Inventory — Suppliers"
      subtitle="Manage suppliers."
      breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Suppliers", href: "/inventory/suppliers" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Inventory — Suppliers workspace.</p>
      </div>
    </NexaShell>
  );
}
