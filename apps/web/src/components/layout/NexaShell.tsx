import React from "react";
import Link from "next/link";

export default function NexaShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-semibold">Nexa</div>
        <nav className="px-2 py-1 space-y-1">
          {[
            ["/dashboard","Dashboard"],
            ["/finance","Finance"],
            ["/inventory","Inventory"],
            ["/manufacturing","Manufacturing"],
            ["/sales","Sales"],
            ["/projects","Projects"],
            ["/hr","HR"],
            ["/pos","POS"],
            ["/ai","AI"]
          ].map(([href, label])=> (
            <Link key={href as string} href={href as string} className="block px-3 py-2 rounded hover:bg-gray-100">{label as string}</Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
          <div className="font-medium">{title}</div>
          <div>Nexa AI</div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}


