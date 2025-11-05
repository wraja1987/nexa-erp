import Page from "@/components/layout/Page";
import Link from "next/link";

export default function HelpPage() {
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
    </Page>
  );
}
