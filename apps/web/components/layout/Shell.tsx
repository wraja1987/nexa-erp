"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

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
  return (
    <div className="flex min-h-screen bg-[rgb(248,250,252)] text-nexa-text">
      <aside data-testid="layout-sidebar" className="w-72 shrink-0 bg-gradient-to-b from-nexa-sidebarBg to-nexa-sidebarBg2 text-white">
        <div className="flex items-center gap-3 px-6 h-20">
          <Image src="/logo-nexa.png" alt="Nexa" width={140} height={40} priority />
        </div>
        <nav className="px-2 pb-6 overflow-y-auto">
          {NAV.map((item) => (
            <div key={item.href} className="mb-2">
              <Link className={`block px-4 py-3 rounded-lg ${pathname.startsWith(item.href) ? "bg:white/10" : "hover:bg-white/5"}`} href={item.href}>{item.label}</Link>
              {item.children?.length ? (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((c) => (
                    <Link key={c.href} className={`block px-3 py-2 rounded-md text-white/80 hover:text-white hover:bg-white/5 ${pathname===c.href?"bg-white/10 text-white":""}`} href={c.href}>{c.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <div data-testid="layout-topbar" className="h-16 border-b border-nexa-border bg-white flex items-center px-6 gap-4">
          <input placeholder="Search…" className="w-[700px] rounded-xl border border-nexa-border px-4 py-2 outline-none" />
          <div className="ml-auto flex items-center gap-5 text-nexa-subtext">
            <span>🔔</span><span>❓</span><span>👤</span>
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
          <div className="bg-white shadow-card rounded-2xl border border-nexa-border p-3 flex gap-2">
            <input className="flex-1 px-4 py-3 rounded-xl border border-nexa-border outline-none" placeholder="Send a message…" />
            <button className="px-4 py-3 rounded-xl bg-nexa-blue text-white">›</button>
          </div>
        </div>
      </main>
    </div>
  );
}
