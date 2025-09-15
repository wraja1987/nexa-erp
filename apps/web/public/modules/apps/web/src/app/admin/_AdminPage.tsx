"use client";
import { useEffect, useState } from "react";
import NexaLayout from "@/components/NexaLayout";
import AdminShell from "@/components/AdminShell";

export default function AdminPage({ jsonPath }: { jsonPath: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch(jsonPath).then(r=>r.json()).then(setData); }, [jsonPath]);
  if (!data) return <div className="p-8">Loading…</div>;
  const breadcrumb = (data.breadcrumbs || []).map((label: string, i: number) => ({
    label,
    href: i === 0 ? "/admin/tenants" : undefined
  }));
  return (
    <AdminShell
      title={data.title || "Admin"}
      breadcrumb={breadcrumb.length ? breadcrumb : [{ label: "Admin", href: "/admin/tenants" }]}
      actions={<div className="hidden md:flex gap-2">
        <button className="h-9 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-100">Export</button>
        <button className="h-9 rounded-xl bg-sky-600 text-white px-3 text-sm hover:bg-sky-700">Create</button>
      </div>}
    >
      <NexaLayout data={data} />
    </AdminShell>
  );
}




