"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { label: string; href: string };

const tabs: Tab[] = [
  { label: "Home", href: "/" },
  { label: "Modules", href: "/modules" },
  { label: "Integrations & API", href: "/integrations" },
  { label: "Security & Compliance", href: "/security" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export default function SiteNav() {
  const pathname = usePathname() || "/";
  return (
    <nav style={{ marginBottom: 16 }} aria-label="Primary">
      <div className="site-nav-fixed" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none' as any,
            flex: 1
          }}
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <li key={tab.href} style={{ flex: '0 0 auto' }}>
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={tab.label}
                  style={{ textDecoration: 'none' }}
                >
                  <span
                    style={{
                      padding: '10px 12px',
                      borderRadius: 9999,
                      border: active ? '2px solid #CBD5E1' : '1px solid #E5E7EB',
                      background: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 600,
                      color: '#0B1424'
                    }}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/login" aria-label="Login" style={{ textDecoration: 'none' }}>
          <span
            style={{
              padding: '10px 16px',
              borderRadius: 9999,
              border: '1px solid #E5E7EB',
              background: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              color: '#0B1424',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            Login
          </span>
        </Link>
      </div>
    </nav>
  );
}










