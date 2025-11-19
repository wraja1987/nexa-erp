export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getPosition() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/banking/cash/position`, { cache: "no-store" });
  if (!res.ok) return { data: { rows: [] as any[], asOf: new Date().toISOString() } };
  return res.json();
}

export default async function CashPositionPage() {
  const { data } = await getPosition();
  return (
    <Page title="Banking — Cash Position">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>As-of {new Date(data.asOf).toLocaleString()}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Currency</th>
                  <th className="text-left p-2">Balance (minor)</th>
                </tr>
              </thead>
              <tbody>
                {(data.rows || []).map((r: any) => (
                  <tr key={r.accountId}>
                    <td className="p-2">{r.code}</td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.currency}</td>
                    <td className="p-2">{Math.round(r.balanceMinor)}</td>
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


