import type { Metadata } from "next";
import { MODULES, type Module, type ModuleCategory, type ModuleStatus } from "@nexa/registry";
import ModuleCard from "@/components/ModuleCard";

export const metadata: Metadata = {
  title: "Nexa Modules & Solutions",
  description: "Explore Nexa’s modules across finance, operations, inventory, manufacturing, HR, and analytics.",
  alternates: { canonical: "https://www.nexaai.co.uk/solutions" },
};

function unique<T>(arr: T[]) { return Array.from(new Set(arr)); }

function getFilters(mods: Module[]) {
  const categories = unique(mods.map(m => m.category)).sort();
  const statuses = unique(mods.map(m => m.status)).sort();
  return { categories, statuses };
}

function applyFilters(mods: Module[], searchParams: { [k: string]: string | string[] | undefined }) {
  const q = (searchParams.q as string)?.toLowerCase()?.trim() || "";
  const cat = (searchParams.category as string) || "All";
  const st = (searchParams.status as string) || "All";

  return mods.filter(m => {
    const matchesQ = !q || m.name.toLowerCase().includes(q) || m.blurb.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    const matchesCat = cat === "All" || m.category === (cat as ModuleCategory);
    const matchesSt = st === "All" || m.status === (st as ModuleStatus);
    return matchesQ && matchesCat && matchesSt;
  });
}

export default function SolutionsPage({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined }}) {
  const all = MODULES;
  const { categories, statuses } = getFilters(all);
  const filtered = applyFilters(all, searchParams);

  const q = (searchParams.q as string) ?? "";
  const category = (searchParams.category as string) ?? "All";
  const status = (searchParams.status as string) ?? "All";

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Solutions</h1>
        <p className="mt-2 max-w-3xl text-zinc-600">Nexa brings finance, operations, and analytics together. Filter by category or status and pick what you need today.</p>
      </section>

      <form className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4" action="/solutions" method="get">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search modules…" className="col-span-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300" />
        <select name="category" defaultValue={category} className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300" aria-label="Filter by category">
          <option value="All">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="status" defaultValue={status} className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300" aria-label="Filter by status">
          <option value="All">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </form>

      <section aria-live="polite" aria-busy="false">
        {filtered.length === 0 ? (
          <p className="rounded-xl bg-zinc-50 p-6 text-sm text-zinc-600">No modules match your search. Try clearing filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(m => <ModuleCard key={m.slug} mod={m} />)}
          </div>
        )}
      </section>

      <section className="mt-12 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6">
        <h2 className="text-xl font-semibold">Not sure where to start?</h2>
        <p className="mt-1 text-sm text-zinc-600">Book a short walkthrough and we’ll tailor a Nexa stack for your team.</p>
        <a href="/contact" className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black">Book a demo</a>
      </section>
    </main>
  );
}
