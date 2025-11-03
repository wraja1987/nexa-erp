"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Projects — Time"
      subtitle="Manage time."
      breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "Time", href: "/projects/time" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Projects — Time workspace.</p>
      </div>
    </NexaShell>
  );
}
