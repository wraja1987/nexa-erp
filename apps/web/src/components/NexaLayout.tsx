import React from "react";
import { fmtMoney, fmtDate } from "@/lib/format/enGB";

export default function NexaLayout({ data }: { data: any }) {
  const layout = data?.layout?.grid || [];
  const isAdmin = String(data?.module || "").startsWith("admin/");
  const Grid = (
    <div className="grid grid-cols-12 gap-4">
      {layout.map((block: any, i: number) => {
        const area = block.area;
        if (area === "kpis") return <Kpis key={i} items={data.kpis} />;
        if (area === "insights") return <Insights key={i} data={data.insights} />;
        if (area === "quickLinks") return <QuickLinks key={i} data={data.quickLinks} />;
        if (area === "table") return <Carded key={i}><TableView data={data.table} /></Carded>;
        if (area === "list") return <Carded key={i}><ListView data={data.list} /></Carded>;
        if (area === "uploader") return <Uploader key={i} data={data.uploader} />;
        if (area === "aiEngine") return <Carded key={i}><AiEngine data={data.aiEngine} /></Carded>;
        return null;
      })}
    </div>
  );
  return (
    <>
      {!isAdmin ? <h1 className="sr-only">{data?.title || "Page"}</h1> : null}
      {isAdmin ? Grid : <main role="main" id="main">{Grid}</main>}
    </>
  );
}

function Kpis({ items = [] as any[] }) {
  if (!items?.length) return null;
  return (
    <section className="col-span-12">
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((k: any, i: number) => (
          <li key={k.id || i} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4" aria-label={`${k.label}: ${k.value}${k.suffix || ""}`}>
            <div className="text-slate-800 text-xs">{k.label}</div>
            <div className="text-slate-900 text-xl font-semibold">{k.value}{k.suffix ? k.suffix : ""}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Insights({ data }: { data: any }) {
  if (!data?.items?.length) return null;
  return (
    <section className="col-span-12 lg:col-span-8">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 text-sm font-medium text-slate-900">{data.title || "Insights"}</div>
        <div className="px-4 py-3 space-y-3">
          {data.items.map((it: any) => (
            <div key={it.id} className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm text-slate-900">{it.message}</div>
              {it.actions?.length ? (
                <div className="mt-2">
                  {it.actions.map((a: any, i: number) => (
                    <a key={i} href={a.href} className="text-sky-700 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">{a.label}</a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks({ data }: { data: any }) {
  if (!data?.items?.length) return null;
  return (
    <section className="col-span-12 lg:col-span-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 text-sm font-medium text-slate-900">{data.title || "Quick Links"}</div>
        <div className="px-4 py-2">
          <ul className="space-y-1">
            {data.items.map((it: any) => (
              <li key={it.id}>
                <a
                  href={it.href}
                  className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label={it.ariaLabel || it.label}
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TableView({ data }: { data: any }) {
  if (!data) return null;
  const cols = data.columns || [];
  const rows = data.rows || [];
  if (!rows.length) {
    return (
      <div>
        {data.title ? <div className="px-4 py-3 text-sm font-medium text-slate-900">{data.title}</div> : null}
        <div className="px-4 py-6">
          <div className="rounded-xl border border-dashed border-slate-200 text-center py-10">
            <div className="text-slate-900 font-medium">No data to show</div>
            <div className="text-slate-600 text-sm mt-1">Try changing filters or add new records.</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {data.title ? <div className="px-4 py-3 text-sm font-medium text-slate-900">{data.title}</div> : null}
      <div className="px-4 py-3 overflow-x-auto" role="region" aria-label={data.title || "Data table"}>
        <table className="w-full text-sm">
          <caption className="sr-only">{data.title || "Data table"}</caption>
          <thead className="text-slate-600">
            <tr>
              {cols.map((c: string, i: number) => (<th key={i} scope="col" className="text-left py-2 pr-4">{c}</th>))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any[], ri: number) => (
              <tr key={ri} className="border-t border-slate-100">
                {r.map((cell: any, ci: number) => (<td key={ci} className="py-2 pr-4">{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListView({ data }: { data: any }) {
  if (!data?.items?.length) return null;
  return (
    <div className="px-4 py-3">
      <ul className="space-y-2">
        {data.items.map((it: any) => (
          <li key={it.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">{it.label || it.text}</li>
        ))}
      </ul>
    </div>
  );
}

function Uploader({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="text-sm font-medium text-slate-900 mb-2">{data.title || "Upload"}</div>
      <input type="file" aria-label="Upload file" className="block" />
    </div>
  );
}

function AiEngine({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="p-4">
      <label htmlFor="ai-engine-input" className="text-sm font-medium text-slate-900 mb-2 block">
        {data.title || "AI Engine"}
      </label>
      <div className="flex gap-2">
        <input
          id="ai-engine-input"
          name="ai-engine-input"
          placeholder={data.placeholder || "Ask…"}
          aria-label={data.placeholder || "Ask AI"}
          className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
        <button aria-label="Send AI query" className="h-10 rounded-xl bg-sky-600 text-white px-4 text-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600">
          Send
        </button>
      </div>
    </div>
  );
}

function Carded({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">{children}</div>;
}


