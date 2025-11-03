"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function NexaShell({
  title,
  subtitle,
  breadcrumbs,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href: string }[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6" role="main">
          <div className="mb-6">
            {breadcrumbs && (
              <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-2">
                {breadcrumbs.map((b, i) => (
                  <span key={b.href}>
                    <a href={b.href} className="hover:underline">{b.label}</a>
                    {i < breadcrumbs.length - 1 && " / "}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}


