"use client";

import Link from "next/link";

export function Header() {
  return (
    <header role="banner" className="flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
          Nexa
        </Link>
      </div>
      <nav aria-label="Utility" className="flex items-center gap-2">
        <Link href="/help" className="text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
          Help
        </Link>
      </nav>
    </header>
  );
}


