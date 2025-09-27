import React from 'react';

export default function AiEngineBar({ context }: { context?: string }){
  return (
    <div>
      <div style={{ height: 10, background: 'linear-gradient(90deg, var(--color-blue), var(--color-violet))', borderRadius: 999 }} />
      <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>AI Engine active{context ? ` — ${context}` : ''}</div>
    </div>
  );
}
