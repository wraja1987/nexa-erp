"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type ModuleNode = {
  id: string;
  title: string;
  path: string;
  children?: ModuleNode[];
};

export default function NexaLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [tree, setTree] = React.useState<ModuleNode[]>([]);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/modules?tree=1");
        const data = await res.json();
        if (Array.isArray(data)) setTree(data);
      } catch { /* noop */ }
    })();
  }, []);

  const isActive = (href: string) =>
    router.pathname === href || router.asPath === href;

  const toggle = (id: string) =>
    setOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg,#F7F9FC)", color: "var(--color-text,#0B1424)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "linear-gradient(180deg,#2E6BFF 0%,#7A4DFF 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo-nexa.png" alt="Nexa" style={{ height: 28 }} />
          <span style={{ fontWeight: 700, letterSpacing: .3 }}>Nexa ERP</span>
        </div>

        <nav style={{ padding: 10, overflowY: "auto", flex: 1 }}>
          <div style={{ margin: "8px 0", fontSize: 12, opacity: .85 }}>Dashboard</div>
          <SideLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />

          <div style={{ margin: "12px 0 6px", fontSize: 12, opacity: .85 }}>Modules</div>
          {tree.map((node) => (
            <div key={node.id} style={{ marginBottom: 6 }}>
              <button
                onClick={() => node.children?.length ? toggle(node.id) : router.push(node.path)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: 8, border: 0, cursor: "pointer",
                  background: isActive(node.path) ? "rgba(255,255,255,.18)" : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", gap: 8
                }}
              >
                {node.children?.length ? <Caret open={!!open[node.id]} /> : <span style={{ width: 10 }} />}
                <span>{node.title}</span>
              </button>
              {node.children?.length ? (
                <div style={{
                  maxHeight: open[node.id] ? 600 : 0,
                  overflow: "hidden",
                  transition: "max-height .18s ease",
                  marginLeft: 20
                }}>
                  {node.children
                    .slice()
                    .sort((a,b)=>a.title.localeCompare(b.title))
                    .map((ch) => (
                      <SideLink key={ch.id} href={ch.path} label={ch.title} active={isActive(ch.path)} />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <footer style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,.15)", fontSize: 12, display: "grid", gap: 6 }}>
          <FooterLink href="#" label="Privacy" />
          <FooterLink href="#" label="Cookies" />
          <FooterLink href="#" label="Accessibility" />
          <FooterLink href="#" label="Security" />
        </footer>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{
          height: 56, background: "#fff", borderBottom: "1px solid #E5EAF1",
          display: "flex", alignItems: "center", padding: "0 16px", gap: 12
        }}>
          <input placeholder="Search"
            style={{ flex: 1, height: 34, border: "1px solid #D3DBE6", borderRadius: 8, padding: "0 12px" }} />
          <TopButton label="Help" />
          <TopButton label="Alerts" />
          <div style={{
            width: 32, height: 32, borderRadius: 16, background: "#2E6BFF",
            display: "grid", placeItems: "center", color: "#fff", fontWeight: 700
          }}>U</div>
        </header>

        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </div>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 10,
      transform: open ? "rotate(90deg)" : "none",
      transition: "transform .12s"
    }}>▶</span>
  );
}

function SideLink(props: { href: string; label: string; active?: boolean }) {
  const { href, label, active } = props;
  return (
    <Link href={href} style={{
      display: "block",
      padding: "6px 10px",
      borderRadius: 8,
      color: "#fff",
      background: active ? "rgba(255,255,255,.12)" : "transparent",
      textDecoration: "none",
      marginBottom: 4,
      fontSize: 14
    }}>{label}</Link>
  );
}

function TopButton({ label }: { label: string }) {
  return (
    <button style={{
      height: 34, padding: "0 10px",
      border: "1px solid #D3DBE6", background: "#fff",
      borderRadius: 8, color: "var(--color-text,#0B1424)"
    }}>{label}</button>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} style={{ color: "#fff", opacity: .9, textDecoration: "none" }}>{label}</a>
  );
}
