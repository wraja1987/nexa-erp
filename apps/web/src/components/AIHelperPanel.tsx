"use client"
import { useEffect } from "react"

type Hint = { title: string; detail?: string }

export function AIHelperPanel({ open, onClose, hints, context }: { open: boolean; onClose: () => void; hints: Hint[]; context?: string }) {
  useEffect(() => {
    if (open) {
      try {
        // lightweight observability; no PII
        fetch('/api/ai/audit/logs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'AI_HELPER_VIEW', context: context || 'unknown' }) }).catch(()=>{})
      } catch {}
    }
  }, [open, context])
  if (!open) return null
  return (
    <aside className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l shadow-lg z-40 flex flex-col" aria-label="AI helper panel">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-base font-medium">Insights</h3>
        <button className="px-2 py-1 border rounded" onClick={onClose} aria-label="Close AI helper">Close</button>
      </div>
      <div className="p-3 space-y-3 overflow-auto">
        {hints.length === 0 ? <div>No hints available for this view.</div> : hints.map((h, i) => (
          <div key={i} className="border rounded p-2 bg-gray-50">
            <div className="font-medium">{h.title}</div>
            {h.detail ? <div className="text-sm text-gray-700 mt-1">{h.detail}</div> : null}
          </div>
        ))}
      </div>
    </aside>
  )
}


