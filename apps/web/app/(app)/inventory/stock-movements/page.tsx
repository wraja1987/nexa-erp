"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Inventory — Stock Movements"
      subtitle="Manage stock movements."
      breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Stock Movements", href: "/inventory/stock-movements" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Inventory — Stock Movements workspace.</p>
      </div>
    </NexaShell>
  );
}
