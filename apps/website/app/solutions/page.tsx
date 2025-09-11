"use client";

import modulesData from "@/data/modules.json" assert { type: "json" };
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type ModuleItem = { slug: string; name: string; desc: string; actions?: string[] };
type Category = { category: string; items: ModuleItem[] };

function unique<T>(arr: T[]) { return Array.from(new Set(arr)); }

function flatten(all: Category[]) {
  return all.flatMap(cat => cat.items.map(i => ({ ...i, category: cat.category })));
}

function SolutionsContent() {
  const searchParams = useSearchParams();
  const allCats = modulesData as Category[];
  const all = useMemo(() => flatten(allCats), [allCats]);

  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const category = searchParams.get("category") || "All";

  const categories = useMemo(() => ["All", ...unique(all.map(m => (m as any).category))], [all]);

  const filtered = useMemo(() => {
    return all.filter(m => {
      const matchesQ = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || (m as any).category.toLowerCase().includes(q);
      const matchesCat = category === "All" || (m as any).category === category;
      return matchesQ && matchesCat;
    });
  }, [all, q, category]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-10">
        <div className="hero-band">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Solutions</h1>
            <p className="max-w-3xl opacity-90">Explore Nexa’s modules across Finance, Operations, Manufacturing, HR and Analytics. Everything is available today — pick what you need and scale.</p>
            <div className="pt-1">
              <a href="/contact#demo" className="btn-primary">Request a tailored demo</a>
            </div>
          </div>
        </div>
      </section>

      <form className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4" action="/solutions" method="get">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search modules…" className="col-span-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300" />
        <select name="category" defaultValue={category} className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300" aria-label="Filter by category">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </form>

      <section aria-live="polite" aria-busy="false">
        {filtered.length === 0 ? (
          <p className="rounded-xl bg-zinc-50 p-6 text-sm text-zinc-600">No modules match your search. Try clearing filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(m => (
              <article key={m.slug} className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold">{m.name}</h3>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">Active</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">{m.desc}</p>
                  {Array.isArray((m as any).actions) && (m as any).actions.length > 0 && (
                    <ul className="mt-3 text-sm text-zinc-600 list-disc pl-5 space-y-1">
                      {(m as any).actions.slice(0,5).map((a: string) => <li key={a}>{a}</li>)}
                    </ul>
                  )}
                  <div className="mt-3">
                    <a href={`/docs#${m.slug}`} className="btn-secondary text-sm">Read the docs</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6">
        <h2 className="text-xl font-semibold">Not sure where to start?</h2>
        <p className="mt-1 text-sm text-zinc-600">Book a short walkthrough and we’ll tailor a Nexa stack for your team.</p>
        <a href="/contact#demo" className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black">Book a demo</a>
      </section>
    </main>
  );
}

export default function SolutionsPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><p className="opacity-80">Loading…</p></main>}>
      <SolutionsContent />
    </Suspense>
  );
}
