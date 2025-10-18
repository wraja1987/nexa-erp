import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function AIHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">AI</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/ai/playbooks" className="text-blue-600">Playbooks</a></li>
        <li><a href="/ai/documents" className="text-blue-600">Documents</a></li>
        <li><a href="/ai/insights" className="text-blue-600">Insights</a></li>
        <li><a href="/ai/settings" className="text-blue-600">Settings</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("AI", withAuthGuard(AIHome));


