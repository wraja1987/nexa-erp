export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getPayslips() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/hr/payroll/payslips/list`, { cache: "no-store" });
  if (!res.ok) return { slips: [] as any[] };
  return res.json();
}

export default async function PayslipsPage() {
  const { slips } = await getPayslips();
  return (
    <Page title="HR — Payslips">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Employee</th>
                  <th className="text-left p-2">Run</th>
                  <th className="text-left p-2">Gross</th>
                  <th className="text-left p-2">Net</th>
                </tr>
              </thead>
              <tbody>
                {(slips || []).length === 0 ? (
                  <tr><td className="p-2" colSpan={4}>No payslips found.</td></tr>
                ) : (slips || []).map((s: any) => (
                  <tr key={s.id}>
                    <td className="p-2">{s.employeeId}</td>
                    <td className="p-2">{s.runId}</td>
                    <td className="p-2">{Number(s.grossPay || 0)}</td>
                    <td className="p-2">{Number(s.netPay || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}


