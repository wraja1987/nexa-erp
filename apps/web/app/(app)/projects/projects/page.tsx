export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function ProjectsPage() {
  const res = await fetch("/api/projects/projects/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Projects • Projects">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          Project entities are not present in the schema. This list is currently empty.
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Budget</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.code}</td>
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.status}</td>
                  <td className="py-2 pr-4">{r.budget ?? "—"}</td>
                </tr>
              ))}
              {!rows?.length && <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No projects found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


