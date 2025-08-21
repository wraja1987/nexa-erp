import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Tokens = Record<string, string>;

function maskPrompt(raw: string): string {
  return raw
    .replace(/([\w.-]+@[\w.-]+\.[A-Za-z]{2,})/g, '[email]')
    .replace(/(\+?\d[\d\s-]{7,}\d)/g, '[phone]')
    .replace(/(sk-[A-Za-z0-9]{20,})/g, '[secret]');
}

function diffTokens(a: Tokens, b: Tokens): Array<{ key: string; before?: string; after?: string }>{
  const keys = new Set([...Object.keys(a||{}), ...Object.keys(b||{})]);
  const out: Array<{ key: string; before?: string; after?: string }> = [];
  for (const k of keys) {
    if ((a?.[k] ?? '') !== (b?.[k] ?? '')) out.push({ key: k, before: a?.[k], after: b?.[k] });
  }
  return out;
}

export default function AppearanceSettings(){
  const [canSee, setCanSee] = useState(false);
  const [status, setStatus] = useState('');
  const [current, setCurrent] = useState<Tokens>({
    '--bg':'#ffffff','--fg':'#0b0d14','--card':'#f8fafc','--border':'#e1e6ef'
  });
  const [proposal, setProposal] = useState<Tokens>({});
  const [snapshots, setSnapshots] = useState<Array<{id:string;createdAtIso:string;note?:string}>>([]);

  useEffect(()=>{ void init(); },[]);

  async function init(){
    setStatus('');
    const ff = (process.env.NEXT_PUBLIC_FEATURE_FLAG_THEME_AI || process.env.FEATURE_FLAG_THEME_AI || '0');
    const role = (document.cookie.match(/role=([^;]+)/)?.[1] || '').toUpperCase();
    const allowed = ff === '1' && (role === 'SUPERADMIN' || role === 'ADMIN');
    setCanSee(allowed);
    if (!allowed) return;
    try {
      const res = await fetch('/api/settings/appearance/snapshots');
      if (res.ok) setSnapshots(await res.json());
    } catch {}
  }

  async function onGenerate(){
    setStatus('');
    const prompt = window.prompt('Describe the theme (no secrets/PII).') || '';
    const masked = maskPrompt(prompt);
    const res = await fetch('/api/settings/appearance/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: masked }) });
    if (!res.ok) { setStatus('Generate blocked'); return; }
    const data = await res.json();
    setProposal(data.tokens || {});
  }

  async function onApply(){
    const confirmed = window.confirm('Apply the proposed theme? This creates a snapshot.');
    if (!confirmed) return;
    const res = await fetch('/api/settings/appearance/apply', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tokens: proposal }) });
    if (!res.ok) { setStatus('Apply failed'); return; }
    await init();
    setStatus('Applied');
  }

  async function onRollback(id:string){
    const confirmed = window.confirm('Rollback to selected snapshot?');
    if (!confirmed) return;
    const res = await fetch(`/api/settings/appearance/rollback?id=${encodeURIComponent(id)}`, { method:'POST' });
    if (!res.ok) { setStatus('Rollback failed'); return; }
    await init();
    setStatus('Rolled back');
  }

  const changes = useMemo(()=> diffTokens(current, proposal), [current, proposal]);

  if (!canSee) return (
    <main style={{padding:24}}>
      <h1>Appearance</h1>
      <p>Theme AI requires admin privileges and FEATURE_FLAG_THEME_AI=1.</p>
    </main>
  );

  return (
    <main style={{padding:24}}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>
        <img src="/public/logo-optra.png" alt="Optra ERP logo" width={22} height={22} />
        Theme AI (Appearance)
        <Link href="/docs/settings/theme-ai.mdx" style={{ marginLeft:8 }} aria-label="Help">?</Link>
      </h1>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={onGenerate}>Generate</button>
        <button onClick={onApply} disabled={!changes.length}>Apply</button>
        {status && <span role="status" style={{marginLeft:8}}>{status}</span>}
      </div>
      <h2 style={{marginTop:16}}>Preview changes</h2>
      {changes.length ? (
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr><th style={{textAlign:'left'}}>Token</th><th style={{textAlign:'left'}}>Before</th><th style={{textAlign:'left'}}>After</th></tr></thead>
          <tbody>
          {changes.map(c => (
            <tr key={c.key}>
              <td>{c.key}</td>
              <td>{c.before || ''}</td>
              <td>{c.after || ''}</td>
            </tr>
          ))}
          </tbody>
        </table>
      ) : <p>No pending changes.</p>}

      <h2 style={{marginTop:16}}>Snapshots</h2>
      <ul>
        {snapshots.map(s => (
          <li key={s.id}>
            <button onClick={()=>onRollback(s.id)} aria-label={`Rollback ${s.id}`}>{new Date(s.createdAtIso).toLocaleString()} — {s.id}</button>
            {s.note && <span style={{marginLeft:8, opacity:0.8}}>{s.note}</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}

export { maskPrompt, diffTokens };


