export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";
import { getSessionContext } from "@/lib/auth/tenant.server";

async function getData(params: URLSearchParams, cookie: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const qs = params.toString();
  const res = await fetch(`${base}/api/finance/reports/revenue/schedule${qs ? `?${qs}` : ""}`, { cache: "no-store", headers: { Cookie: cookie } as any });
  if (!res.ok) return { ok: false, items: [], periods: [] } as any;
  return res.json();
}

export default async function RevenueSchedulePage({ searchParams }: { searchParams: any }) {
  const { userId, tenantId } = await getSessionContext();
  const params = new URLSearchParams();
  params.set("tenantId", tenantId);
  if (searchParams?.from) params.set("from", String(searchParams.from));
  if (searchParams?.to) params.set("to", String(searchParams.to));
  const cookie = `next-auth.session-token=${userId}`;
  const data = await getData(params, cookie);
  return (
    <Page title="Revenue Schedule (Computed)">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
            Recognition mode: INSTANT (invoice date). If due date present and after issue date, OVER_TIME_SIMPLE (even by month). Computed only; no persistence.
          </div>
          <div className="mb-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Current Legal Entity: {tenantId}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <label className="text-sm">
              Dimension Type
              <select className="block mt-1 border rounded-md px-2 py-1 w-full" disabled>
                <option>Not available (schema gaps)</option>
              </select>
            </label>
            <label className="text-sm col-span-2">
              Dimension Values
              <input className="block mt-1 border rounded-md px-2 py-1 w-full" placeholder="Disabled — no dimension links in schema" disabled />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Period</th>
                  <th className="text-left p-2">Amount (minor)</th>
                </tr>
              </thead>
              <tbody>
                {(data?.periods || []).map((p: any) => (
                  <tr key={p.period}>
                    <td className="p-2">{p.period}</td>
                    <td className="p-2">{Math.round(p.amountMinor)}</td>
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


