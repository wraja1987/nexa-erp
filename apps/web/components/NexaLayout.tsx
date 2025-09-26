"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type ModuleItem = { id: string; title: string; path: string; icon?: string; order: number };

export default function NexaLayout(props: { children?: React.ReactNode }) {
  const { children } = props;
  const router = useRouter();
  const [modules, setModules] = React.useState<ModuleItem[]>([]);

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/modules');
        const json = await res.json();
        setModules(Array.isArray(json) ? json : []);
      } catch {
        setModules([]);
      }
    };
    run();
  }, []);

  const isActive = (href: string) => router.pathname === href || router.asPath === href;

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <aside style={{ width: 260, background: 'var(--color-navy)', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo-nexa.png" alt="Nexa" style={{ height: 28 }} />
          <span style={{ fontWeight: 600, letterSpacing: 0.4 }}>Nexa ERP</span>
        </div>
        <nav style={{ padding: 8, overflowY: 'auto', flex: 1 }}>
          <div style={{ margin: '8px 0', fontSize: 12, opacity: 0.8 }}>Dashboard</div>
          <SidebarLink href="/dashboard" label="Dashboard" active={isActive('/dashboard')} />
          <div style={{ margin: '12px 0 6px', fontSize: 12, opacity: 0.8 }}>Modules</div>
          {modules.map((m) => (
            <SidebarLink key={m.id} href={m.path} label={m.title} active={isActive(m.path)} />
          ))}
        </nav>
        <footer style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, display: 'grid', gap: 6 }}>
          <FooterLink href="#" label="Privacy" />
          <FooterLink href="#" label="Cookies" />
          <FooterLink href="#" label="Accessibility" />
          <FooterLink href="#" label="Security" />
        </footer>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #E5EAF1', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
          <input placeholder="Search" style={{ flex: 1, height: 34, border: '1px solid #D3DBE6', borderRadius: 8, padding: '0 12px' }} />
          <TopButton label="Help" />
          <TopButton label="Alerts" />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--color-blue)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 600 }}>U</div>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </div>
  );
}

function SidebarLink(props: { href: string; label: string; active?: boolean }) {
  const { href, label, active } = props;
  return (
    <Link href={href} style={{
      display: 'block',
      padding: '8px 12px',
      borderRadius: 8,
      color: '#fff',
      background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
      textDecoration: 'none',
      marginBottom: 4,
    }}>{label}</Link>
  );
}

function TopButton(props: { label: string }) {
  return (
    <button style={{
      height: 34,
      padding: '0 10px',
      border: '1px solid #D3DBE6',
      background: '#fff',
      borderRadius: 8,
      color: 'var(--color-text)',
    }}>{props.label}</button>
  );
}

function FooterLink(props: { href: string; label: string }) {
  return (
    <a href={props.href} style={{ color: '#fff', opacity: 0.9, textDecoration: 'none' }}>{props.label}</a>
  );
}
