import Image from "next/image";
import Link from "next/link";
import "../../styles/globals.css";
import { NexaAIBar } from "@/components/ai/nexa-ai-bar";

function Chevron() {
  return (
    <svg className="h-4 w-4 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/>
    </svg>
  );
}

function Module({ title, href, items }: { title: string; href?: string; items?: [string,string][] }) {
  const has = items && items.length > 0;
  return (
    <details open className="group">
      <summary className="summary">
        {href ? <Link href={href}>{title}</Link> : <span>{title}</span>}
        {has && <Chevron/>}
      </summary>
      {has && (
        <ul className="ml-2 space-y-1 pb-2">
          {items!.map(([label, link]) => (
            <li key={link}><Link href={link} className="nav-item">{label}</Link></li>
          ))}
        </ul>
      )}
    </details>
  );
}

export const metadata = { title: "Nexa ERP" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="preload" as="image" href="/logo-nexa.png" /></head>
      <body className="min-h-screen nexa-gradient antialiased">
        <div className="grid grid-cols-[260px_1fr] grid-rows-[1fr_auto] min-h-screen">
          <aside className="row-span-2 sidebar">
            <div className="flex items-center gap-3 px-5 py-4">
              <Image src="/logo-nexa.png" alt="Nexa" width={132} height={36} priority className="h-9 w-auto" />
            </div>
            <nav className="px-2 space-y-1 text-sm">
              <Module title="Dashboard" href="/dashboard" />
              <Module title="Finance" items={[["General Ledger","/finance/gl"],["Accounts Payable","/finance/ap"],["Accounts Receivable","/finance/ar"],["Bank & Cash","/finance/bank"],["VAT (MTD)","/finance/vat"],["Fixed Assets","/finance/fa"],["Period Close","/finance/close"],["FX Revaluation","/finance/fx"],["Reports","/finance/reports"],["Invoices","/finance/invoices"],["Bills","/finance/bills"],["Purchase Orders","/finance/purchase-orders"],["Payments","/finance/payments"]]} />
              <Module title="HR & Payroll" items={[["Employees","/hr/employees"],["Payroll","/hr/payroll"],["Leave","/hr/leave"]]} />
              <Module title="Inventory & WMS" items={[["Items","/inventory/items"],["Adjustments","/inventory/adjustments"],["Transfers","/inventory/transfers"],["Warehouses","/inventory/warehouses"]]} />
              <Module title="Manufacturing" items={[["BOMs","/manufacturing/boms"],["Work Orders","/manufacturing/work-orders"],["Schedules","/manufacturing/schedules"]]} />
              <Module title="Sales & CRM" items={[["Leads","/sales/leads"],["Opportunities","/sales/opportunities"],["Quotes","/sales/quotes"],["Orders","/sales/orders"]]} />
              <Module title="Purchasing" items={[["Suppliers","/purchasing/suppliers"],["Orders","/purchasing/orders"]]} />
              <Module title="Projects" items={[["Boards","/projects/boards"],["Tasks","/projects/tasks"],["Timesheets","/projects/timesheets"]]} />
              <Module title="POS" items={[["Register","/pos/register"],["Receipts","/pos/receipts"]]} />
              <Module title="AI" items={[["Assistant","/ai/assistant"],["Automation","/ai/automation"]]} />
              <Module title="Costing" href="/costing" />
              <Module title="Help" href="/help" />
            </nav>
          </aside>
          <main className="relative p-6">{children}</main>
          <NexaAIBar />
        </div>
      </body>
    </html>
  );
}


