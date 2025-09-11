"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { ok: boolean; status: string; error?: string }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      company: String(formData.get("company") || ""),
      message: String(formData.get("message") || ""),
    };
    try {
      setSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as any;
      setSubmitted(data);
      e.currentTarget.reset();
    } catch (err) {
      setSubmitted({ ok: false, status: "error", error: err instanceof Error ? err.message : String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Contact</h1>
          <p className="mt-2 opacity-90">Book a demo or ask a question. We’ll get back to you promptly.</p>
        </div>
      </section>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
        <input className="rounded-md border p-3" name="name" placeholder="Name" required />
        <input className="rounded-md border p-3" name="email" placeholder="Email" required type="email" />
        <input className="rounded-md border p-3 md:col-span-2" name="company" placeholder="Company (optional)" />
        <textarea className="rounded-md border p-3 md:col-span-2" name="message" placeholder="Message" required rows={5} />
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Sending..." : "Send"}</button>
        </div>
      </form>
      {submitted && (
        <p className="text-sm opacity-80">{submitted.ok ? "Thanks! We received your message." : `Error: ${submitted.error || submitted.status}`}</p>
      )}
    </div>
  );
}
