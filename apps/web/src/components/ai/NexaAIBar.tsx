"use client"
import { useAI } from '../../lib/ai/useAI'

export default function NexaAIBar() {
  const { suggestions, loading, explain, suggestNext, draftMessage } = useAI()
  return (
    <div aria-label="Nexa AI" style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 12px', border:'1px solid #eaecef', borderRadius:8 }}>
      <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: loading ? '#6aa84f' : '#9fc5e8', display:'inline-block', animation: loading ? 'pulse 1.2s infinite ease-in-out' : 'none' }} />
      {suggestions.slice(0,3).map(s=> (
        <button key={s.id} onClick={async ()=>{
          if (s.text.includes('Explain')) await explain();
          else if (s.text.includes('Suggest')) await suggestNext();
          else await draftMessage();
        }}>{s.text}</button>
      ))}
      <style>{`@media (prefers-reduced-motion: reduce){ *{ animation: none !important; } } @keyframes pulse{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}`}</style>
    </div>
  )
}


