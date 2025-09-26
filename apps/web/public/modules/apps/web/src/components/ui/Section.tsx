import { ReactNode } from "react";
export default function Section({ area, children }: { area: string; children: ReactNode }) {
  const map: Record<string,string> = {
    kpis: "col-span-12",
    insights: "col-span-12 lg:col-span-8",
    quickLinks: "col-span-12 lg:col-span-4",
    table: "col-span-12",
    list: "col-span-12",
    uploader: "col-span-12",
    aiEngine: "col-span-12"
  };
  return <section className={map[area] || "col-span-12"}>{children}</section>;
}







