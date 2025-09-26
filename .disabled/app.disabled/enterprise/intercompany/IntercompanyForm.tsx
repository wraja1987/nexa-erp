"use client"

export default function IntercompanyForm() {
  async function onSubmit(formData: FormData) {
    const payload = {
      fromEntityId: String(formData.get('from')),
      toEntityId: String(formData.get('to')),
      ref: String(formData.get('ref')),
      amount: Number(formData.get('amount') || 0),
      currency: 'GBP' as const,
    }
    await fetch('/api/enterprise/intercompany', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-role': 'admin' },
      body: JSON.stringify(payload)
    })
    location.reload()
  }
  return (
    <form action={onSubmit} style={{ display:'flex', gap:8, marginTop:12 }}>
      <input name="ref" placeholder="Ref" aria-label="Reference" required />
      <input name="from" placeholder="From entity" aria-label="From entity" required />
      <input name="to" placeholder="To entity" aria-label="To entity" required />
      <input name="amount" type="number" step="0.01" placeholder="Amount" aria-label="Amount" required />
      <button type="submit">Post</button>
    </form>
  )
}



