"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Inventory — Categories"
      subtitle="Manage categories."
      breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Categories", href: "/inventory/categories" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Inventory — Categories workspace.</p>
      </div>
    </NexaShell>
  );
}
