import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function CrmIntegrationsPage() {
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Advanced CRM Integrations <ComingSoonBadge /></h1>
      <p>Connect Email, Calendar, and Dialler in a safe mocked mode. No external calls are made.</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
        <button disabled title="Mocked">Connect Google</button>
        <button disabled title="Mocked">Connect Microsoft 365</button>
        <button disabled title="Mocked">Connect Twilio Dialler</button>
      </div>
      <section aria-labelledby="ai-help" style={{ marginTop:16, padding:12, border:'1px solid #eaecef', borderRadius:8 }}>
        <h2 id="ai-help">What Nexa AI will do here</h2>
        <ul>
          <li>Summarise call outcomes and draft follow-ups.</li>
          <li>Propose meeting slots based on calendars.</li>
          <li>Highlight high-priority leads from interactions.</li>
        </ul>
      </section>
    </main>
  )
}


