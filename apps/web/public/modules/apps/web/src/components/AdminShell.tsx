"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { adminModules } from "@/lib/router/adminModules";

export default function AdminShell({
  title,
  breadcrumb,
  actions,
  children
}: {
  title: string;
  breadcrumb: { label: string; href?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top header */}
      <header role="banner" className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-3">
          <Link href="/app/dashboard" className="font-semibold text-slate-800 hover:text-slate-900" aria-label="Nexa home">
            Nexa
          </Link>
          <div aria-hidden className="text-slate-300">/</div>
          <Link href="/admin/tenants" className="text-slate-700 hover:text-slate-900">Admin</Link>
          <div className="ml-auto flex items-center gap-2">
            <input
              aria-label="Search admin"
              placeholder="Search admin…"
              className="h-9 w-64 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button className="h-9 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-100" aria-label="Open help">Help</button>
            <button className="h-9 rounded-full border border-slate-200 px-3 text-sm hover:bg-slate-100" aria-label="User menu">AK</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 grid grid-cols-12 gap-6" role="presentation">
        {/* Sidebar */}
        <aside role="navigation" aria-label="Admin sections" className="col-span-3 xl:col-span-2">
          <nav className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ul className="py-2">
              {adminModules.map((m) => {
                const href = `/admin/${m.slug}`;
                const active = pathname?.startsWith(href);
                return (
                  <li key={m.slug}>
                    <Link
                      href={href}
                      className={[
                        "block px-4 py-2.5 text-sm",
                        active ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                      ].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {m.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main role="main" className="col-span-9 xl:col-span-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600 mb-2">
            <ol className="flex items-center gap-2">
              {breadcrumb.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  {b.href ? <Link href={b.href} className="hover:underline">{b.label}</Link> : <span>{b.label}</span>}
                  {i < breadcrumb.length - 1 ? <span aria-hidden>/</span> : null}
                </li>
              ))}
            </ol>
          </nav>

          {/* Title + sticky actions */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h1>
              {actions ? (
                <div className="sticky top-[64px] z-30">{actions}</div>
              ) : null}
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-12 gap-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}







