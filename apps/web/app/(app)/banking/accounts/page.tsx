export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getAccounts() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/banking/accounts/list`, { cache: "no-store" });
  if (!res.ok) return { accounts: [] as any[] };
  return res.json();
}

export default async function BankingAccountsPage() {
  const { accounts } = await getAccounts();
  return (
    <Page title="Banking — Accounts">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Manage bank accounts. Create/update is available via API; archive not supported (schema gap).
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Currency</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {(accounts || []).map((a: any) => (
                  <tr key={a.id}>
                    <td className="p-2">{a.code}</td>
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.currency}</td>
                    <td className="p-2">{new Date(a.createdAt).toLocaleString()}</td>
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


