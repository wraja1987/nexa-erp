import React from 'react';
export default function InsightsPanel({ items }: { items: string[] }){
  if (!Array.isArray(items) || items.length === 0) return <div className="nexa-card" style={{ padding: 12 }}>No insights</div>;
  return (
    <ul style={{ margin: 0, padding: 12, listStyle: 'disc inside' }}>
      {items.map((t,i)=> <li key={i} style={{ color: '#0B1424' }}>{t}</li>)}
    </ul>
  );
}
