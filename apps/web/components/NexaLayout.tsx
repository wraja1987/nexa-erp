"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Node = { id:string; title:string; path:string; children?:Node[] };

export default function NexaLayout({children}:{children?:React.ReactNode}){
  const router = useRouter();
  const [tree, setTree] = React.useState<Node[]>([]);
  React.useEffect(()=>{ (async()=>{
    try{
      const q = new URLSearchParams({tree:"1"}).toString();
      const res = await fetch(`/api/modules?${q}`);
      setTree(await res.json());
    }catch{ setTree([]); }
  })(); },[]);
  const isActive = (href:string)=> router.asPath === href || router.pathname === href;

  return (
    <div style={{minHeight:"100vh", display:"flex"}}>
      <aside style={{width:260, background:"var(--color-navy)", color:"#fff", display:"flex", flexDirection:"column"}}>
        <div style={{padding:16, borderBottom:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", gap:8}}>
          <img src="/logo-nexa.png" alt="Nexa" style={{height:28}} />
          <span style={{fontWeight:600, letterSpacing:.4}}>Nexa ERP</span>
        </div>
        <nav style={{padding:8, overflowY:"auto", flex:1}}>
          <div style={{margin:"8px 0", fontSize:12, opacity:.8}}>Dashboard</div>
          <SideLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />

          <div style={{margin:"12px 0 6px", fontSize:12, opacity:.8}}>Modules</div>
          {tree.map((n)=> <TreeItem key={n.id} node={n} activePath={router.asPath} />)}
        </nav>
        <footer style={{padding:12, borderTop:"1px solid rgba(255,255,255,0.1)", fontSize:12, display:"grid", gap:6}}>
          <FooterLink href="#" label="Privacy" />
          <FooterLink href="#" label="Cookies" />
          <FooterLink href="#" label="Accessibility" />
          <FooterLink href="#" label="Security" />
        </footer>
      </aside>

      <div style={{flex:1, display:"flex", flexDirection:"column"}}>
        <header style={{height:56, background:"#fff", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", padding:"0 16px", gap:12}}>
          <input placeholder="Search" style={{flex:1, height:34, border:"1px solid #D3DBE6", borderRadius:8, padding:"0 12px"}} />
          <TopButton label="Help" />
          <TopButton label="Alerts" />
          <div style={{width:32, height:32, borderRadius:16, background:"var(--color-blue)", display:"grid", placeItems:"center", color:"#fff", fontWeight:600}}>U</div>
        </header>
        <main style={{padding:16}}>{children}</main>
      </div>
    </div>
  );
}

function TreeItem({node, activePath}:{node:Node; activePath:string}){
  const hasChildren = !!node.children?.length;
  const [open, setOpen] = React.useState(false);
  React.useEffect(()=>{
    if (hasChildren && node.children!.some(c=>c.path===activePath)) setOpen(true);
  },[activePath, hasChildren, node.children]);
  return (
    <div style={{marginBottom:4}}>
      <div onClick={()=> hasChildren && setOpen(v=>!v)} style={{display:"flex", alignItems:"center", gap:8, cursor: hasChildren ? "pointer" : "default"}}>
        {hasChildren ? <Chevron open={open}/> : <span style={{width:10}}/>}
        <SideLink href={node.path} label={node.title} active={activePath===node.path} />
      </div>
      {hasChildren && open && (
        <div style={{marginLeft:22, marginTop:2}}>
          {node.children!.map(c=>
            <SideLink key={c.id} href={c.path} label={c.title} active={activePath===c.path} />
          )}
        </div>
      )}
    </div>
  );
}
function Chevron({open}:{open:boolean}){
  return (<span style={{display:"inline-block", width:10, transform: open ? "rotate(90deg)" : "none", transition:"transform .12s"}}>▶</span>);
}
function SideLink({href,label,active}:{href:string; label:string; active?:boolean}){
  return (
    <Link href={href} style={{
      display:"block", padding:"8px 12px", borderRadius:8, color:"#fff",
      background: active ? "rgba(255,255,255,0.12)" : "transparent",
      textDecoration:"none"
    }}>{label}</Link>
  );
}
function TopButton({label}:{label:string}){
  return <button className="nexa-btn" style={{height:34, background:"#fff", color:"var(--color-text)", border:"1px solid #D3DBE6"}}>{label}</button>;
}
function FooterLink({href,label}:{href:string; label:string}){
  return <a href={href} style={{color:"#fff", opacity:.9, textDecoration:"none"}}>{label}</a>;
}
