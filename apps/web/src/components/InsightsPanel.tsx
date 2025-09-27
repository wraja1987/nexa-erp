import React from 'react';

export default function InsightsPanel({ items }: { items: string[] }){
  if (!items?.length) return <div style={{ color: 'var(--color-muted)' }}>No insights yet</div>;
  return (
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {items.map((i, idx) => <li key={idx} style={{ marginBottom: 6 }}>{i}</li>)}
    </ul>
  );
}
