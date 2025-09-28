import React from 'react';

export type QuickLink = { label: string; href: string };

export default function QuickLinks({ links }: { links: QuickLink[] }){
  if (!links?.length) return <div style={{ color: 'var(--color-muted)' }}>No quick actions configured</div>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {links.map(l => (
        <a key={l.href} href={l.href} className="nexa-btn" style={{ display: 'inline-flex', alignItems: 'center' }}>{l.label}</a>
      ))}
    </div>
  );
}
