"use client";
import { useEffect, useState, useRef } from "react";
import { loadExpanded, saveExpanded } from "@/src/lib/sidebarState";
type Node = { id: string; label: string; href?: string; children?: Node[] };
const demoTree: Node[] = [
  { id: "finance", label: "Finance", children: [
    { id: "invoices", label: "Invoices", href: "/modules/finance/invoices" },
    { id: "bills", label: "Bills", href: "/modules/finance/bills" },
  ]},
  { id: "sales", label: "Sales & CRM", children: [
    { id: "orders", label: "Orders", href: "/modules/sales-crm/sales-orders" },
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
