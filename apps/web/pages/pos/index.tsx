import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function POSHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Point of Sale</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/pos/register" className="text-blue-600">Register</a></li>
        <li><a href="/pos/sessions" className="text-blue-600">Sessions</a></li>
        <li><a href="/pos/receipts" className="text-blue-600">Receipts</a></li>
        <li><a href="/pos/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("POS", withAuthGuard(POSHome));


