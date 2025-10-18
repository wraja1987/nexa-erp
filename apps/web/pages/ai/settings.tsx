import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function Settings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">AI Settings</h2>
      <p>Configure your AI document and playbook settings.</p>
    </div>
  );
}

export default withNexaLayout("AI — Settings", withAuthGuard(Settings));


