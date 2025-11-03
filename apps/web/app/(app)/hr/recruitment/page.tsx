"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="Hr — Recruitment"
      subtitle="Manage recruitment."
      breadcrumbs={[{ label: "Hr", href: "/hr" }, { label: "Recruitment", href: "/hr/recruitment" }]}>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa Hr — Recruitment workspace.</p>
      </div>
    </NexaShell>
  );
}
