export default function ContactPage() {
  async function submit(formData: FormData) {
    'use server'
    const payload = {
      name: String(formData.get('name')||''),
      email: String(formData.get('email')||''),
      company: String(formData.get('company')||''),
      message: String(formData.get('message')||''),
    }
    await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) } as any)
  }
  return (
    <form action={submit}>
      <h1>Contact</h1>
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" required type="email" />
      <input name="company" placeholder="Company" />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send</button>
    </form>
  )
}
