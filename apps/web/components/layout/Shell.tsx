"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useState } from "react";

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
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const submitAi = useCallback(async () => {
    if (!aiText.trim()) return;
    setAiBusy(true);
    try {
      await fetch("/api/ai/audit/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: aiText, at: new Date().toISOString() }),
      }).catch(() => {});
    } finally {
      setAiBusy(false);
      setAiText("");
    }
  }, [aiText]);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <aside data-testid="layout-sidebar" className="w-72 shrink-0 text-white" style={{ background: "linear-gradient(180deg,#2E6BFF 0%,#7A4DFF 100%)" }}>
        <div className="flex items-center gap-3 px-6 h-20">
          <Image src="/logo-nexa.png" alt="Nexa" width={140} height={40} priority />
        </div>
        <nav className="px-2 pb-6 overflow-y-auto">
          {NAV.map((item) => (
            <div key={item.href} className="mb-2">
              <Link className={`block px-4 py-3 rounded-lg ${pathname.startsWith(item.href) ? "bg-white/10" : "hover:bg-white/10"}`} href={item.href}>{item.label}</Link>
              {item.children?.length ? (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((c) => (
                    <Link key={c.href} className={`block px-3 py-2 rounded-md text-white hover:text-white hover:bg-white/10 ${pathname===c.href?"bg-white/15 text-white":""}`} href={c.href}>{c.label}</Link>
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
          </div>
        </div>

        {title !== undefined && (
          <div className="px-8 pt-8">
            <h1 data-testid="page-title" className="text-3xl font-semibold">{title}</h1>
            <div className="text-sm text-nexa-subtext mt-1">Dashboard</div>
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
        </div>
      </main>
    </div>
  );
}
