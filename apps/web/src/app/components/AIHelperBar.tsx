"use client"
import { useEffect, useState } from 'react'

export default function AIHelperBar() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/'
    const base: Record<string, string[]> = {
      '/billing': ['Review subscriptions', 'Create invoice draft'],
      '/open-banking': ['Sync bank accounts', 'Export transactions CSV'],
      '/tax/mtd-vat': ['Fetch obligations', 'Prepare return'],
      '/settings/connectors': ['Test all connectors', 'Review job status'],
    }
    setSuggestions(base[path] || ['Open quick actions panel'])
  }, [])
  const onQuick = (s: string) => {
    console.log('[ai-helper] quick', s)
  }
  return (
    <div role="complementary" aria-label="AI Helper" style={{ position:'fixed', left:0, right:0, bottom:0, background:'#111827', color:'#fff', padding:'8px 12px', display:'flex', gap:8, alignItems:'center', zIndex:1000 }}>
      <strong>AI Helper</strong>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {suggestions.map(s => (
          <button key={s} onClick={()=>onQuick(s)} style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:14, padding:'4px 10px' }}>{s}</button>
        ))}
      </div>
    </div>
  )
}


