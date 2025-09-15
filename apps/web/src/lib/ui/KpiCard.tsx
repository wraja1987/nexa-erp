"use client"
import { useEffect, useState } from "react"

type Props = {
  title: string
  endpoint: string
  valueKey?: string
  format?: (v: any) => string
}

export default function KpiCard({ title, endpoint, valueKey = "value", format }: Props){
  const [value, setValue] = useState<any>("…")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run(){
      try{
        const res = await fetch(endpoint, { cache: "no-store" })
        const data = await res.json()
        if(!cancelled){
          const raw = data?.[valueKey]
          setValue(format ? format(raw) : (raw ?? "—"))
        }
      }catch(e){ if(!cancelled){ setError("1") } }
    }
    run()
    return () => { cancelled = true }
  }, [endpoint, valueKey, format])

  return (
    <div className="nx-card nx-kpi">
      <strong>{title}</strong>
      <div style={{ fontSize: 30, marginTop: 8 }}>
        {error ? "—" : value}
      </div>
    </div>
  )
}


