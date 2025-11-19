Last updated: 2025-11-16

Purpose
- Describe current HR/Payroll capabilities and safe v1 behaviour on the existing schema. Call out gaps.

Available now in schema
- Employee(id, tenantId, empNo, firstName, lastName, email, createdAt, updatedAt)
- PaySchedule(id, tenantId, name, frequency)
- PayrollRun(id, tenantId, scheduleId, periodStart, periodEnd, status)
- Payslip(id, tenantId, runId, employeeId, grossPay, netPay)
- Allowance(id, payslipId, name, amount, tenantId)
- Deduction(id, payslipId, name, amount, tenantId)

Missing/partial; requires Task 2 or separate work
- Departments, Contracts (salary/hourly rate, start/end, cost centres)
- Timesheets (no timesheet models present)
- UK PAYE/NI/pension configuration (tax codes, NI categories, rates)
- RTI submission storage and HMRC integration endpoints
- Payroll account mapping configuration (expense/liability breakdown)

Phase 3 behaviour (implemented)
- Employees: list/get/create/update; deactivate returns 501 (no status field).
- Timesheets: scaffolding only (endpoints return 501; no models).
- Payroll engine: build/commit runs; creates payslips with gross/net derived from allowances/deductions if provided; otherwise 0.
- Payroll journals: safe default mapping (Payroll Expense vs Payroll Liability), tenant-scoped, posted via existing GL mechanics.
- HMRC: export scaffolding (JSON payload), no live submission.


