"use client"
import { useAI } from '../../lib/ai/useAI'

export default function RecommendationsPanel() {
  const { suggestions } = useAI()
  const items = suggestions.map((s, i) => ({ id: s.id, text: `Recommendation ${i+1}: ${s.text}` }))
  return (
    <aside aria-label="Recommendations" style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
      <h2 style={{ marginTop:0 }}>Recommendations</h2>
      <ul>
        {items.map(i=> <li key={i.id}>{i.text}</li>)}
      </ul>
    </aside>
  )
}



