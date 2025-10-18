import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function ProjectsHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Projects</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/projects/boards" className="text-blue-600">Boards</a></li>
        <li><a href="/projects/tasks" className="text-blue-600">Tasks</a></li>
        <li><a href="/projects/time" className="text-blue-600">Time</a></li>
        <li><a href="/projects/billing" className="text-blue-600">Billing</a></li>
        <li><a href="/projects/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("Projects", withAuthGuard(ProjectsHome));


