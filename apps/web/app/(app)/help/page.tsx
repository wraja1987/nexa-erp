import Page from "@/components/layout/Page";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export default async function HelpPage() {
  const session = await getServerSession(authOptions as any).catch(()=>null);
  const role = ((session as any)?.user?.role || "USER").toString().toUpperCase();
  const links = [
    { label: "Getting Started", href: "/help#getting-started" },
    { label: "Finance: Invoices & VAT (MTD)", href: "/finance" },
    { label: "Inventory & WMS", href: "/inventory" },
    { label: "HR & Payroll", href: "/hr" },
    { label: "Manufacturing", href: "/manufacturing" },
    { label: "Sales & CRM", href: "/sales" },
  ];
  return (
    <Page title="Help">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Browse help topics or jump directly to a module. Use the AI Engine to ask contextual questions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl border p-4 hover:bg-slate-50" style={{ borderColor: "var(--border)" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-12">
        <div id="getting-started" className="rounded-2xl border bg-white p-6 mt-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-xl font-semibold">Using Nexa ERP</h2>
          <p>These short guides explain how to use Nexa for your daily tasks and operations.</p>

          {role === "SUPER_ADMIN" && (
          <section>
            <h3 className="font-semibold">Super Admin</h3>
            <ul className="list-disc ml-6 text-sm" style={{ color: "var(--color-muted)" }}>
              <li>Invite users and assign roles (Super Admin, Admin, Standard).</li>
              <li>Configure tenants, default currency, timezone and VAT settings.</li>
              <li>Review audit logs on the Alerts page and set rate‑limits/headers in Ops.</li>
            </ul>
          </section>
          )}

          {role === "ADMIN" && (
          <section>
            <h3 className="font-semibold">Admin</h3>
            <ul className="list-disc ml-6 text-sm" style={{ color: "var(--color-muted)" }}>
              <li>Manage Finance (invoices, bills, VAT submissions) and HR (employees, payroll).</li>
              <li>Maintain master data (items, suppliers, warehouses) and posting rules.</li>
              <li>Use the AI Engine for assisted workflows (e.g. “Draft a dunning email”).</li>
            </ul>
          </section>
          )}

          {role === "USER" && (
          <section>
            <h3 className="font-semibold">Standard User</h3>
            <ul className="list-disc ml-6 text-sm" style={{ color: "var(--color-muted)" }}>
              <li>Raise documents you have access to (e.g. sales orders, purchase orders).</li>
              <li>Upload evidence and attach files to transactions where required.</li>
              <li>Search, filter and export lists using the toolbar on each module page.</li>
            </ul>
          </section>
          )}

          <section>
            <h3 className="font-semibold">Tips</h3>
            <ul className="list-disc ml-6 text-sm" style={{ color: "var(--color-muted)" }}>
              <li>Look for the AI bar at the bottom of the page; it understands where you are.</li>
              <li>Use the left navigation to expand a module and pick the sub‑module you need.</li>
              <li>Press / to focus search, and ? for keyboard shortcuts.</li>
            </ul>
          </section>
        </div>
      </div>
    </Page>
  );
}
