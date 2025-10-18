import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function HRHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">HR</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/hr/employees" className="text-blue-600">Employees</a></li>
        <li><a href="/hr/payroll" className="text-blue-600">Payroll</a></li>
        <li><a href="/hr/leave" className="text-blue-600">Leave</a></li>
        <li><a href="/hr/attendance" className="text-blue-600">Attendance</a></li>
        <li><a href="/hr/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("HR", withAuthGuard(HRHome));


