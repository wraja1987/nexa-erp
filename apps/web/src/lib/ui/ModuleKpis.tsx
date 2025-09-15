"use client"
import { usePathname } from "next/navigation"
import { summaryMap } from "../router/summaryMap"
import KpiCard from "./KpiCard"

export default function ModuleKpis(){
  const pathname = usePathname() || "/app/dashboard"
  const parts = pathname.split("/").filter(Boolean)
  const mod = parts[1] || "dashboard"
  const sub = parts[2]
  const map = summaryMap[mod] || { _: "/api/dashboard/summary" }
  const endpoint = (sub && map[sub]) || map._

  // Basic 3-card layout using the same endpoint keys if available
  return (
    <div className="nx-grid nx-cols-3">
      <KpiCard title="Metric A" endpoint={endpoint} valueKey="a" />
      <KpiCard title="Metric B" endpoint={endpoint} valueKey="b" />
      <KpiCard title="Metric C" endpoint={endpoint} valueKey="c" />
    </div>
  )
}







