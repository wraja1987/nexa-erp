"use client"

export default function NewOrder() {
  async function onSubmit(formData: FormData) {
    const payload = {
      tenantId: 'demo-tenant',
      channelId: String(formData.get('channel')),
      extId: String(formData.get('extId')),
      status: 'created' as const,
      total: Number(formData.get('total') || 0),
    }
    await fetch('/api/marketplace/orders', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(payload) })
    location.reload()
  }
  return (
    <form action={onSubmit} style={{ display:'flex', gap:8, marginTop:12 }}>
      <input name="channel" placeholder="Channel ID" required aria-label="Channel ID" />
      <input name="extId" placeholder="External ID" required aria-label="External ID" />
      <input name="total" type="number" step="0.01" placeholder="Total" required aria-label="Total" />
      <button type="submit">Add order</button>
    </form>
  )
}



