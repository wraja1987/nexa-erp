# Payroll

- What it does: Schedules, runs, payslips, deductions and allowances (demo calculation).
- Key endpoints: `/api/payroll/runs` (GET/POST).
- Roles & permissions: superadmin/admin write; users can view their payslips.
- Data model: `Employee`, `PaySchedule`, `PayrollRun`, `Payslip`, `Deduction`, `Allowance`.
- Jobs: `payroll:run` creates demo runs.
- Common tasks: create schedule, run payroll, review payslips.
- Troubleshooting: date range must be valid; ensure `scheduleId` exists.
