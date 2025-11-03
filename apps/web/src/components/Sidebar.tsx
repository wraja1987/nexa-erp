"use client";
import { useEffect, useState, useRef } from "react";
import { loadExpanded, saveExpanded } from "@/lib/sidebarState";
type Node = { id: string; label: string; href?: string; children?: Node[] };
const demoTree: Node[] = [
  { id: "finance", label: "Finance", children: [
    { id: "customer-invoice", label: "Customer Invoice", href: "/modules/finance/invoices" },
    { id: "supplier-bill", label: "Supplier Bill", href: "/modules/finance/bills" },
    { id: "bank-account", label: "Bank Account", href: "/modules/finance/bank-accounts" },
    { id: "journal-entry", label: "Journal Entry", href: "/modules/finance/journal-entries" },
    { id: "ledger", label: "Ledger", href: "/modules/finance/ledger" },
    { id: "kpi-snapshot", label: "Kpi Snapshot", href: "/modules/finance/kpi" },
  ]},
  { id: "operations", label: "Operations", children: [
    { id: "warehouse", label: "Warehouse", href: "/modules/operations/warehouse" },
    { id: "location", label: "Location", href: "/modules/operations/locations" },
    { id: "work-order", label: "Work Order", href: "/modules/operations/work-orders" },
    { id: "inventory-lot", label: "Inventory Lot", href: "/modules/operations/inventory-lots" },
    { id: "quality-inspection", label: "Quality Inspection", href: "/modules/operations/quality/inspections" },
    { id: "quality-hold", label: "Quality Hold", href: "/modules/operations/quality/holds" },
    { id: "capa", label: "Capa", href: "/modules/operations/quality/capa" },
    { id: "third-party-connector", label: "Third Party Connector", href: "/modules/operations/connectors" },
  ]},
  { id: "procurement", label: "Procurement", children: [
    { id: "purchase-order", label: "Purchase Order", href: "/modules/procurement/purchase-orders" },
    { id: "po-line", label: "Po Line", href: "/modules/procurement/po-lines" },
  ]},
  { id: "hr", label: "HR & Payroll", children: [
    { id: "employee", label: "Employee", href: "/modules/hr/employees" },
    { id: "payroll-run", label: "Payroll Run", href: "/modules/hr/payroll-runs" },
    { id: "payslip", label: "Payslip", href: "/modules/hr/payslips" },
  ]},
  { id: "notifications", label: "Notifications", children: [
    { id: "notification", label: "Notification", href: "/modules/notifications/list" },
    { id: "notification-job", label: "Notification Job", href: "/modules/notifications/jobs" },
    { id: "audit-log", label: "Audit Log", href: "/modules/notifications/audit-log" },
  ]},
  { id: "pos", label: "POS", children: [
    { id: "store", label: "Store", href: "/modules/pos/stores" },
    { id: "pos-sale", label: "Pos Sale", href: "/modules/pos/sales" },
    { id: "pos-line", label: "Pos Line", href: "/modules/pos/lines" },
    { id: "pos-payment", label: "Pos Payment", href: "/modules/pos/payments" },
    { id: "pos-refund", label: "Pos Refund", href: "/modules/pos/refunds" },
  ]},
];
export default function Sidebar({ userId = "demo-user", tree = demoTree }: { userId?: string; tree?: Node[] }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setExpanded(loadExpanded(userId)); }, [userId]);
  useEffect(() => { saveExpanded(userId, expanded); }, [userId, expanded]);
  function toggle(id: string) { setExpanded(x => x.includes(id) ? x.filter(y => y!==id) : [...x, id]); }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const items = listRef.current?.querySelectorAll<HTMLElement>("[data-node-id]") || [];
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? Array.from(items).indexOf(active) : -1;
      if (e.key === "ArrowDown") { e.preventDefault(); const n = items[Math.min(items.length-1, Math.max(0, idx+1))]; n?.focus(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); const n = items[Math.max(0, idx-1)]; n?.focus(); return; }
      if (e.key === "ArrowRight") { const cur = active?.dataset.nodeId; if (!cur) return; if (!expanded.includes(cur)) setExpanded(x => [...x, cur]); return; }
      if (e.key === "ArrowLeft") { const cur = active?.dataset.nodeId; if (!cur) return; if (expanded.includes(cur)) setExpanded(x => x.filter(y => y!==cur)); return; }
      if (e.key === "Enter") { const a = active?.querySelector("a") as HTMLAnchorElement | null; if (a) { e.preventDefault(); a.click(); } }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);
  function NodeItem({ node, depth=0 }: { node: Node; depth?: number }) {
    const hasChildren = (node.children?.length || 0) > 0;
    const isOpen = expanded.includes(node.id);
    return (
      <div className="select-none">
        <div tabIndex={0} data-node-id={node.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ paddingLeft: 8 + depth*12 }}>
          <div className="flex items-center gap-2">
            {hasChildren && (<button onClick={() => toggle(node.id)} aria-label={isOpen? "Collapse" : "Expand"}>{isOpen ? "▾" : "▸"}</button>)}
            {node.href ? <a href={node.href} className="hover:underline">{node.label}</a> : <span>{node.label}</span>}
          </div>
          {!hasChildren ? null : <span className="text-xs text-slate-400">{isOpen? "Open" : "Closed"}</span>}
        </div>
        {hasChildren && isOpen && (<div className="ml-3">{node.children!.map(c => <NodeItem key={c.id} node={c} depth={depth+1} />)}</div>)}
      </div>
    );
  }
  return (<aside className="w-full" aria-label="Sidebar"><div ref={listRef} className="space-y-1">{tree.map(n => <NodeItem key={n.id} node={n} />)}</div></aside>);
}
