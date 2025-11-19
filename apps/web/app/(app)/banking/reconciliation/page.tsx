export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getUnreconciled() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/banking/reconciliation/unreconciled`, { cache: "no-store" });
  if (!res.ok) return { lines: [] as any[] };
  return res.json();
}

async function getSuggestions() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/banking/reconciliation/suggest`, { cache: "no-store" });
  if (!res.ok) return { suggestions: [] as any[] };
  return res.json();
}

export default async function BankingReconciliationPage() {
  const [{ lines }, { suggestions }] = await Promise.all([getUnreconciled(), getSuggestions()]);
  return (
    <Page title="Banking — Reconciliation">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Suggestion-only matching based on amount/date. Commit will flag bank line as reconciled; linkage persistence is a schema gap.
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-2">Unreconciled Bank Lines</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lines || []).map((l: any) => (
                      <tr key={l.id}>
                        <td className="p-2">{new Date(l.date).toLocaleDateString()}</td>
                        <td className="p-2">{l.description}</td>
                        <td className="p-2">{Number(l.amount)}</td>
                        <td className="p-2">{l.reference || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Suggested Matches</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Bank Line</th>
                      <th className="text-left p-2">Candidates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(suggestions || []).map((s: any) => (
                      <tr key={s.bankLineId}>
                        <td className="p-2">{s.date} • {s.amount}</td>
                        <td className="p-2">
                          {(s.candidates || []).length ? (
                            <ul className="list-disc pl-4">
                              {s.candidates.map((c: any, i: number) => (
                                <li key={i}>{c.type} • {c.amount} • {new Date(c.paidAt).toLocaleDateString()} • {c.method} {c.reference ? `• ${c.reference}` : ""}</li>
                              ))}
                            </ul>
                          ) : <span>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}


