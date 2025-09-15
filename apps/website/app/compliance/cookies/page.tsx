export default function CookiesPage() {
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Cookies</h1>
          <p className="mt-2 opacity-90">PECR + UK GDPR. We use essential cookies for the site to work, and privacy‑friendly analytics only after consent.</p>
        </div>
      </section>
      <div className="prose max-w-none">
        <h2>Essential cookies</h2>
        <p>These are strictly necessary (for example, your cookie choice). They do not track you and cannot be turned off.</p>

        <h2>Analytics cookies</h2>
        <p>Used to understand page views and improve the site. They run only after you click “Accept all”. No sensitive data is collected.</p>

        <h2>Your choice</h2>
        <p>You can “Accept all” or “Reject non‑essential” using the banner. To change your mind later, run <code>window.NexaReopenCookieBanner()</code> to reopen the banner.</p>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:info@chiefaa.com">info@chiefaa.com</a>.</p>
      </div>
    </div>
  );
}


