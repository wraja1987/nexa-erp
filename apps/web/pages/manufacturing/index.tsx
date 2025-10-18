import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function MfgHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Manufacturing</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/manufacturing/bom" className="text-blue-600">BOM</a></li>
        <li><a href="/manufacturing/work-orders" className="text-blue-600">Work Orders</a></li>
        <li><a href="/manufacturing/scheduling" className="text-blue-600">Scheduling</a></li>
        <li><a href="/manufacturing/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("Manufacturing", withAuthGuard(MfgHome));


