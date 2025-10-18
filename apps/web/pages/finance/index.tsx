import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function FinanceHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Finance</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/finance/invoices" className="text-blue-600">Invoices</a></li>
        <li><a href="/finance/bills" className="text-blue-600">Bills</a></li>
        <li><a href="/finance/payments" className="text-blue-600">Payments</a></li>
        <li><a href="/finance/banking" className="text-blue-600">Banking</a></li>
        <li><a href="/finance/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("Finance", withAuthGuard(FinanceHome));


