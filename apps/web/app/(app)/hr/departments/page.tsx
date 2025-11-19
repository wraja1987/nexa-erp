export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getDepartments() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/hr/departments/list`, { cache: "no-store" });
  if (!res.ok) return { departments: [] as any[] };
  return res.json();
}

export default async function DepartmentsPage() {
  const { departments } = await getDepartments();
  return (
    <Page title="HR — Departments">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Schema gap: Departments are not stored yet. This view is read-only with no data.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {(departments || []).length === 0 ? (
                  <tr><td className="p-2" colSpan={2}>No departments found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}


