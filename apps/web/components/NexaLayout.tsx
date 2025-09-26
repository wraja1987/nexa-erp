"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type FlatModule = { id: string; title: string; path: string; order: number };
type TreeModule = FlatModule & { children?: FlatModule[] };

export default function NexaLayout({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [tree, setTree] = React.useState<TreeModule[]>([]);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/modules?tree=1");
        const json = await res.json();
        if (Array.isArray(json)) setTree(json as TreeModule[]);
      } catch (e) {
        setTree([]);
      }
    })();
  }, []);

  const isActive = (href: string) => router.asPath === href || router.pathname === href;
  const toggle = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 260, background: "var(--color-navy)", color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo-nexa.png" alt="Nexa" style={{ height: 28 }} />
          <span style={{ fontWeight: 600, letterSpacing: 0.4 }}>Nexa ERP</span>
        </div>

        <nav style={{ padding: 8, overflowY: "auto", flex: 1 }}>
          <div style={{ margin: "8px 0", fontSize: 12, opacity: 0.8 }}>Dashboard</div>
          <SideLink href="/dashboard" label="Dashboard" active={isActive("/dashboard")} />

          <div style={{ margin: "12px 0 6px", fontSize: 12, opacity: 0.8 }}>Modules</div>
          {tree.map(m => {
            const hasKids = (m.children?.length ?? 0) > 0;
            if (!hasKids) {
              return <SideLink key={m.id} href={m.path} label={m.title} active={isActive(m.path)} />;
            }
            const expanded = !!open[m.id];
            return (
              <div key={m.id} style={{ marginBottom: 4 }}>
                <button
                  onClick={() => toggle(m.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: 0,
                    background: "transparent",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                  aria-expanded={expanded}
                >
                  <Chevron open={expanded} />
                  <span>{m.title}</span>
                </button>
                {expanded && (
                  <div style={{ marginLeft: 22 }}>
                    {m.children!.map(c => (
                      <SideLink key={c.id} href={c.path} label={c.title} active={isActive(c.path)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <footer style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 12, display: "grid", gap: 6 }}>
          <FooterLink href="#" label="Privacy" />
          <FooterLink href="#" label="Cookies" />
          <FooterLink href="#" label="Accessibility" />
          <FooterLink href="#" label="Security" />
        </footer>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #E5EAF1", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
          <input placeholder="Search" style={{ flex: 1, height: 34, border: "1px solid #D3DBE6", borderRadius: 8, padding: "0 12px" }} />
          <TopButton label="Help" />
          <TopButton label="Alerts" />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: "var(--color-blue)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 600 }}>U</div>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span style={{ display: "inline-block", width: 10, transform: open ? "rotate(90deg)" : "none", transition: "transform .12s" }}>▶</span>
  );
}

function SideLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: "block",
      padding: "8px 12px",
      borderRadius: 8,
      color: "#fff",
      background: active ? "rgba(255,255,255,0.12)" : "transparent",
      textDecoration: "none",
      marginBottom: 4
    }}>{label}</Link>
  );
}

function TopButton({ label }: { label: string }) {
  return (
    <button style={{
      height: 34,
      padding: "0 10px",
      border: "1px solid #D3DBE6",
      background: "#fff",
      borderRadius: 8,
      color: "var(--color-text)"
    }}>{label}</button>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return <a href={href} style={{ color: "#fff", opacity: 0.9, textDecoration: "none" }}>{label}</a>;
}
