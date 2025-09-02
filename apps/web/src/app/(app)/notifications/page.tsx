export default function NotificationsPage() {
  return (
    <main>
      <h1>Notifications</h1>
      <Queue />
      <SendForm />
    </main>
  )
}

async function fetchQueued() {
  const res = await fetch('/api/jobs/status', { cache: 'no-store' })
  const jobs = res.ok ? await res.json() : {}
  return jobs
}

async function Queue() {
  const jobs = await fetchQueued()
  const status = jobs?.['notify:send']?.outcome || 'unknown'
  const when = jobs?.['notify:send']?.lastRun || 'never'
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Notification job</h3>
      <p>Status: {status} — Last run: {when}</p>
    </div>
  )
}

'use client'
function SendForm() {
  async function onSubmit(formData: FormData) {
    const payload = {
      tenantId: 'demo-tenant',
      templateId: String(formData.get('template')),
      to: String(formData.get('to')),
      channel: 'sms' as const,
    }
    await fetch('/api/notifications/send', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(payload) })
    location.reload()
  }
  return (
    <form action={onSubmit} style={{ display:'flex', gap:8, marginTop:12 }}>
      <input name="template" placeholder="Template ID" required aria-label="Template ID" />
      <input name="to" placeholder="Recipient" required aria-label="Recipient" />
      <button type="submit">Queue SMS</button>
    </form>
  )
}


