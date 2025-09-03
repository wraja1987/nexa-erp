import Link from "next/link";
import clsx from "clsx";
import Icon from "@/components/Icon";
import type { Module } from "@nexa/registry";

const statusStyles: Record<Module["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  "Coming Soon": "bg-amber-50 text-amber-800 ring-1 ring-amber-700/20",
  Beta: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20",
};

export default function ModuleCard({ mod }: { mod: Module }) {
  return (
    <article className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-100">
          <Icon name={mod.icon || "Boxes"} className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{mod.name}</h3>
            <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[mod.status])}>{mod.status}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{mod.blurb}</p>
          <p className="mt-2 text-xs text-zinc-500">{mod.category}</p>
        </div>
      </div>
      <Link href={`/solutions/${mod.slug}`} className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2" aria-label={`View ${mod.name}`} />
    </article>
  );
}
