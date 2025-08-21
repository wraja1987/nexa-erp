import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

type Role = 'SUPERADMIN' | 'ADMIN' | 'STAFF';

export default function PreviewShell({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [role, setRole] = useState<Role>('ADMIN');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      const root = document.documentElement.style as CSSStyleDeclaration;
      root.setProperty('--bg', isDark ? '#0b0d14' : '#ffffff');
      root.setProperty('--fg', isDark ? '#e7ecf3' : '#0b0d14');
      root.setProperty('--card', isDark ? '#121723' : '#f8fafc');
      root.setProperty('--border', isDark ? '#22304a' : '#e1e6ef');
    }
  }, [isDark, theme]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isiOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = typeof navigator !== 'undefined' && /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);
  const showA2HSBanner = isiOS && isSafari && !deferredPrompt;

  const installButton = useMemo(() => (
    <button
      type="button"
      aria-label="Install Optra PWA"
      onClick={async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch {}
        setDeferredPrompt(null);
      }}
      disabled={!deferredPrompt}
      style={{ marginLeft: 12 }}
    >
      Install App
    </button>
  ), [deferredPrompt]);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong>Phase 3 Preview</strong>
          <span style={{ opacity: 0.7 }}>(not wired live)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: 8 }}>Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)} aria-label="Theme selector">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <label style={{ margin: '0 8px 0 12px' }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Role selector">
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>
          {installButton}
        </div>
      </header>
      <section aria-live="polite" style={{ padding: 16 }}>
        {showA2HSBanner && (
          <div role="note" style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            To install, tap the Share icon and choose "Add to Home Screen".
          </div>
        )}
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>
          Viewing as <strong>{role}</strong>. Seeded demo data available (Leads 50+, Opps 30+, Activities 100+, Tickets 25, etc.).
        </div>
        <RoleContext.Provider value={role}>
          {children}
        </RoleContext.Provider>
      </section>
    </div>
  );
}

import { createContext, useContext } from 'react';
const RoleContext = createContext<Role>('ADMIN');
export const usePreviewRole = () => useContext(RoleContext);


