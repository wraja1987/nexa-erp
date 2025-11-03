"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Pos — Products"
      subtitle="Manage products."
      breadcrumbs={[{ label: "Pos", href: "/pos" }, { label: "Products", href: "/pos/products" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Pos — Products workspace.</p>
      </div>
    </NexaShell>
  );
}
