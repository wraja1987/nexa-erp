import React from 'react';
export type Kpi = { label: string; value?: string | number; hint?: string };
export default function KpiCard({ label, value, hint }: Kpi){
  return (
    <div className="nexa-card" style={{ padding: 12 }}>
      <div style={{ fontSize: 12, color: '#506481' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{typeof value === 'number' ? value.toLocaleString('en-GB') : (value ?? '—')}</div>
      {hint ? <div style={{ fontSize: 12, color: '#6b7a90' }}>{hint}</div> : null}
    </div>
  );
}
