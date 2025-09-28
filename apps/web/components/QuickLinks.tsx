import React from 'react';
export type QuickLink = { label: string; href: string };
export default function QuickLinks({ links }: { links: QuickLink[] }){
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {links.map((l,i)=> <a key={i} href={l.href} className="nexa-btn" style={{ border: '1px solid #D3DBE6', borderRadius: 8, padding: '6px 10px', textDecoration: 'none' }}>{l.label}</a>)}
    </div>
  );
}
