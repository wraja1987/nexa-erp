import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function SalesHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Sales</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/sales/leads" className="text-blue-600">Leads</a></li>
        <li><a href="/sales/opportunities" className="text-blue-600">Opportunities</a></li>
        <li><a href="/sales/quotes" className="text-blue-600">Quotes</a></li>
        <li><a href="/sales/orders" className="text-blue-600">Orders</a></li>
        <li><a href="/sales/customers" className="text-blue-600">Customers</a></li>
        <li><a href="/sales/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("Sales", withAuthGuard(SalesHome));


