"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

const primary: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Finance", href: "/finance" },
  { label: "Inventory", href: "/inventory" },
  { label: "Manufacturing", href: "/manufacturing" },
  { label: "Sales", href: "/sales" },
  { label: "Projects", href: "/projects" },
  { label: "HR", href: "/hr" },
  { label: "POS", href: "/pos" },
  { label: "AI", href: "/ai" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside role="navigation" aria-label="Primary" className="min-h-screen w-[260px] border-r bg-muted/30 p-4">
      <nav className="space-y-1 text-sm">
        {primary.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="block rounded-md px-3 py-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}







