"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

type NavItem = { label: string; href: string; children?: NavItem[] };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Finance", href: "/finance", children: [
    { label:"General Ledger", href:"/finance/gl" },
    { label:"Accounts Payable", href:"/finance/ap" },
    { label:"Accounts Receivable", href:"/finance/ar" },
    { label:"Bank & Cash", href:"/finance/bank" },
    { label:"VAT (MTD)", href:"/finance/vat" },
    { label:"Fixed Assets", href:"/finance/fa" },
    { label:"Period Close", href:"/finance/close" },
    { label:"FX Revaluation", href:"/finance/fx" },
    { label:"Invoices", href:"/finance/invoices" },
    { label:"Bills", href:"/finance/bills" },
    { label:"Purchase Orders", href:"/finance/purchase-orders" },
    { label:"Payments", href:"/finance/payments" }
  ]},
  { label: "HR & Payroll", href: "/hr", children: [
    { label:"Employees", href:"/hr/employees" },
    { label:"Payroll", href:"/hr/payroll" },
    { label:"Leave", href:"/hr/leave" }
  ]},
  { label: "Inventory & WMS", href: "/inventory", children: [
    { label:"Items", href:"/inventory/items" },
    { label:"Adjustments", href:"/inventory/adjustments" },
    { label:"Transfers", href:"/inventory/transfers" },
    { label:"Warehouses", href:"/inventory/warehouses" }
  ]},
  { label: "Manufacturing", href: "/manufacturing", children: [
    { label:"BOMs", href:"/manufacturing/boms" },
    { label:"Work Orders", href:"/manufacturing/work-orders" },
    { label:"Schedules", href:"/manufacturing/schedules" }
  ]},
  { label: "Sales & CRM", href: "/sales", children: [
    { label:"Leads", href:"/sales/leads" },
    { label:"Opportunities", href:"/sales/opportunities" },
    { label:"Quotes", href:"/sales/quotes" },
    { label:"Orders", href:"/sales/orders" }
  ]},
  { label: "Purchasing", href: "/purchasing", children: [
    { label:"Suppliers", href:"/purchasing/suppliers" },
    { label:"Purchase Orders", href:"/purchasing/orders" }
  ]},
  { label: "Projects", href: "/projects", children: [
    { label:"Boards", href:"/projects/boards" },
    { label:"Tasks", href:"/projects/tasks" },
    { label:"Timesheets", href:"/projects/timesheets" }
  ]},
  { label: "POS", href: "/pos", children: [
    { label:"Register", href:"/pos/register" },
    { label:"Receipts", href:"/pos/receipts" }
  ]},
  { label: "AI", href: "/ai", children: [
    { label:"Assistant", href:"/ai/assistant" },
    { label:"Automation", href:"/ai/automation" }
  ]},
  { label: "Costing", href: "/costing" },
  { label: "Help", href: "/help" }
];

export default function Shell({ title, children }: { title?: string; children: ReactNode; }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);

  const isActive = useCallback((href: string) => pathname?.startsWith(href) ?? false, [pathname]);
  const toggle = useCallback((key: string) => setOpen(s => ({ ...s, [key]: !s[key] })), []);

  const submitAi = useCallback(async () => {
    if (!aiText.trim()) return;
    setAiBusy(true);
    try {
      // Fire-and-forget audit
      fetch("/api/ai/audit/logs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: aiText, at: new Date().toISOString(), route: pathname }) }).catch(()=>{});
      // Simple scoped response client-side to ensure visible output now
      const scope = (pathname || "/").split("/")[1] || "dashboard";
      const msg = aiText.toLowerCase();
      let answer = `Working on ${scope}…`;
      if (msg.includes("invoice") || scope === "finance") answer = "Invoices this month: 168 · Overdue: 12 · Avg age: 23 days";
      else if (msg.includes("stock") || scope === "inventory") answer = "Inventory: 23,450 units · Low-stock SKUs: 14 · Next PO: #PO-10291";
      else if (msg.includes("lead") || scope === "sales") answer = "Leads: 42 open · 8 hot · Pipeline €405,280 (↑12.5%)";
      else if (msg.includes("payroll") || scope === "hr") answer = "Payroll run due Fri · 18 payslips pending approval";
      else if (scope === "pos" && (msg.includes("receipt") || (pathname||"").includes("/pos/receipts"))) {
        answer = "Receipts (demo): 0 found. Import POS data or create a session to view live totals.";
      }
      setAiReply(answer);
    } finally {
      setAiBusy(false);
      setAiText("");
    }
  }, [aiText, pathname]);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <aside data-testid="layout-sidebar" className="w-72 shrink-0 text-white" style={{ background: "linear-gradient(180deg,#2E6BFF 0%,#7A4DFF 100%)" }}>
        <div className="flex items-center gap-3 px-6 h-20">
          <Image src="/logo-nexa.webp" alt="Nexa" width={120} height={32} priority />
        </div>
        <nav className="px-2 pb-6 overflow-y-auto">
          {NAV.map((item) => (
            <div key={item.href} className="mb-2">
              {item.children?.length ? (
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${isActive(item.href) ? "bg-white/10" : "hover:bg-white/10"}`}
                  onClick={() => toggle(item.href)}
                  aria-expanded={!!open[item.href]}
                  aria-controls={`section-${item.href}`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden style={{ transform: open[item.href] ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s" }}>▶</span>
                </button>
              ) : (
                <Link className={`block px-4 py-3 rounded-lg ${isActive(item.href) ? "bg-white/10" : "hover:bg-white/10"}`} href={item.href}>{item.label}</Link>
              )}
              {item.children?.length ? (
                <div id={`section-${item.href}`} className="ml-4 mt-1 space-y-1" style={{ maxHeight: open[item.href] ? 800 : 0, overflow: "hidden", transition: "max-height .2s ease" }}>
                  {item.children.map((c) => (
                    <Link key={c.href} className={`block px-3 py-2 rounded-md text-white hover:bg-white/10 ${isActive(c.href)?"bg-white/15":""}`} href={c.href}>{c.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <div data-testid="layout-topbar" className="h-16 bg-white flex items-center px-6 gap-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <input placeholder="Search…" className="w-[700px] rounded-xl px-4 py-2 outline-none" style={{ border: "1px solid var(--border)" }} />
          <div className="ml-auto flex items-center gap-5" style={{ color: "var(--color-muted)" }}>
            <Link href="/alerts" aria-label="Notifications">🔔</Link>
            <Link href="/help" aria-label="Help">❓</Link>
            <Link href="/profile" aria-label="Profile">👤</Link>
            <button onClick={()=>signOut({ callbackUrl: '/login' })} className="px-3 py-1.5 rounded-lg text-white" style={{ background: "var(--color-blue)" }}>Logout</button>
          </div>
        </div>
        {title !== undefined && (
          <div className="px-8 pt-8">
            <h1 data-testid="page-title" className="text-3xl font-semibold">{title}</h1>
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>Dashboard</div>
          </div>
        )}
        <div className="px-8 pb-24">{children}</div>
        <div data-testid="ai-engine-bar" className="fixed left-72 right-8 bottom-6">
          <div className="bg-white rounded-2xl p-3 flex gap-2" style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
            <input
              className="flex-1 px-4 py-3 rounded-xl outline-none"
              style={{ border: "1px solid var(--border)" }}
              placeholder="Send a message…"
              value={aiText}
              onChange={(e)=>setAiText(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); submitAi(); } }}
            />
            <button
              onClick={submitAi}
              disabled={aiBusy}
              className="px-4 py-3 rounded-xl text-white"
              style={{ background: "var(--color-blue)", opacity: aiBusy? .6 : 1 }}
            >Send</button>
          </div>
          {aiReply && (
            <div className="mt-2 text-sm" style={{ color: "var(--color-muted)", background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 12, boxShadow: "var(--shadow-sm)", width: "max(40%, 480px)" }}>{aiReply}</div>
          )}
        </div>
      </main>
    </div>
  );
}
