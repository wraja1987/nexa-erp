import React from 'react';
export default function AiEngineBar({ context }: { context: string }){
  return (
    <div className="nexa-card" style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span role="img" aria-label="AI">🤖</span>
      <span>AI Engine ready for {context}</span>
    </div>
  );
}
