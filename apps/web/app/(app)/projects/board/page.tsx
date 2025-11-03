"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Projects — Board"
      subtitle="Manage board."
      breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Board", href: "/projects/board" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Projects — Board workspace.</p>
      </div>
    </NexaShell>
  );
}
