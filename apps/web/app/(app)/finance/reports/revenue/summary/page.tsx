export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";
import { getSessionContext } from "@/lib/auth/tenant.server";

async function getData(params: URLSearchParams, cookie: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const qs = params.toString();
  const res = await fetch(`${base}/api/finance/reports/revenue/summary${qs ? `?${qs}` : ""}`, { cache: "no-store", headers: { Cookie: cookie } as any });
  if (!res.ok) return { ok: false, recognised: 0, deferred: 0 } as any;
  return res.json();
}

export default async function RevenueSummaryPage({ searchParams }: { searchParams: any }) {
  const { userId, tenantId } = await getSessionContext();
  const params = new URLSearchParams();
  params.set("tenantId", tenantId);
  if (searchParams?.asOf) params.set("asOf", String(searchParams.asOf));
  const cookie = `next-auth.session-token=${userId}`;
  const data = await getData(params, cookie);
  return (
    <Page title="Revenue Summary (As-of)">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
            As-of: {data?.asOf || "—"} · Recognition mode: INSTANT or linear by month if due date present.
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
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-xl p-4" style={{ borderColor: "var(--border)" }}>
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>Recognised</div>
              <div className="font-medium">{Math.round(Number(data?.recognised || 0))}</div>
            </div>
            <div className="border rounded-xl p-4" style={{ borderColor: "var(--border)" }}>
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>Deferred</div>
              <div className="font-medium">{Math.round(Number(data?.deferred || 0))}</div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}


