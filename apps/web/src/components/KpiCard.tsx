import React from 'react';

export type Kpi = { label: string; value?: string; hint?: string };

export default function KpiCard({ label, value, hint }: Kpi){
  return (
    <div className="nexa-card">
      <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value ?? '—'}</div>
      {hint ? <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{hint}</div> : null}
    </div>
  );
}
