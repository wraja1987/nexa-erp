"use client";
import * as React from "react";
import Link from "next/link";

type Node = { id: string; title: string; path: string; children?: Node[] };

function flatten(nodes: Node[]): Node[] {
  const out: Node[] = [];
  const visit = (n: Node) => { out.push(n); (n.children||[]).forEach(visit); };
  nodes.forEach(visit); return out;
}

export default function Sidebar(){
  const [tree, setTree] = React.useState<Node[]>([]);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(()=>{ (async()=>{
    try{
      const res = await fetch('/api/modules?tree=1', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) setTree(data);
    }catch{}
  })(); },[]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(containerRef.current?.querySelectorAll('[role="treeitem"]') || []) as HTMLElement[];
    const currentIndex = items.findIndex(el => el === document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length-1, currentIndex+1)]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, currentIndex-1)]?.focus(); }
    if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    if (e.key === 'End') { e.preventDefault(); items[items.length-1]?.focus(); }
    if (e.key === 'ArrowRight' && document.activeElement) {
      const id = (document.activeElement as HTMLElement).dataset.id;
      if (id && (open[id] !== true)) setOpen(s=>({ ...s, [id]: true }));
    }
    if (e.key === 'ArrowLeft' && document.activeElement) {
      const id = (document.activeElement as HTMLElement).dataset.id;
      if (id && (open[id] === true)) setOpen(s=>({ ...s, [id]: false }));
    }
  };

  return (
    <nav aria-label="Primary" style={{padding:10, overflowY:'auto', flex:1}}>
      <div style={{ margin: '8px 0', fontSize: 12, opacity: .85 }}>Dashboard</div>
      <Link href="/dashboard" className="nexa-link" style={{ display:'block', padding:'6px 10px' }}>Dashboard</Link>

      <div style={{ margin: '12px 0 6px', fontSize: 12, opacity: .85 }}>Modules</div>
      <div role="tree" aria-label="Modules" ref={containerRef} onKeyDown={onKeyDown}>
        {tree.map((n)=> (
          <TreeNode key={n.id} node={n} open={!!open[n.id]} setOpen={(v)=>setOpen(s=>({ ...s, [n.id]: v }))} depth={0} />
        ))}
      </div>
    </nav>
  );
}

function TreeNode({ node, open, setOpen, depth }:{ node: Node; open: boolean; setOpen:(v:boolean)=>void; depth:number }){
  const hasChildren = (node.children?.length || 0) > 0;
  return (
    <div style={{ marginBottom: 4, marginLeft: depth ? 12 : 0 }}>
      <button
        role="treeitem"
        aria-expanded={hasChildren ? open : undefined}
        aria-label={node.title}
        data-id={node.id}
        onClick={()=> hasChildren ? setOpen(!open) : undefined}
        onDoubleClick={()=> { if(!hasChildren) window.location.href = node.path; }}
        tabIndex={0}
        style={{
          width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:8,
          padding:'6px 10px', borderRadius:8, border:0, background:'transparent', color:'#fff', cursor:'pointer'
        }}
      >
        {hasChildren ? <Caret open={open}/> : <span style={{width:10}}/>}
        <Link href={node.path} style={{ color:'#fff', textDecoration:'none' }}>{node.title}</Link>
      </button>
      {hasChildren && open && (
        <div>
          {node.children!.map(c=> (
            <TreeNode key={c.id} node={c} open={false} setOpen={()=>{}} depth={depth+1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Caret({ open }:{ open:boolean }){
  return (<span aria-hidden style={{display:'inline-block', width:10, transform: open ? 'rotate(90deg)' : 'none', transition:'transform .12s'}}>▶</span>);
}
