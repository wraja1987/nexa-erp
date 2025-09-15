export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Privacy Policy (UK GDPR)</h1>
          <p className="mt-2 opacity-90">Chief A.A Ltd — contact: info@chiefaa.com • +44 7398 975374</p>
        </div>
      </section>
      <div className="prose max-w-none">
        <h2>Who we are</h2>
        <p>Chief A.A Ltd provides the Nexa ERP product. We are the controller for personal data processed in connection with this website and enquiries.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Contact details</strong> — name, email, phone, company.</li>
          <li><strong>Enquiry details</strong> — what you tell us in the contact form or by email.</li>
          <li><strong>Usage data</strong> — only if you consent to analytics; high‑level event data, no sensitive fields.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To respond to your enquiry and provide information about Nexa.</li>
          <li>To improve the site and understand interest in our product (analytics only after consent).</li>
          <li>To meet legal obligations and maintain security and audit logs.</li>
        </ul>

        <h2>Lawful bases</h2>
        <p><strong>Legitimate interests</strong> for responding to enquiries and running our business. <strong>Consent</strong> for analytics. You can withdraw consent at any time.</p>

        <h2>Sharing</h2>
        <p>We use trusted service providers for hosting, email and analytics. We do not sell personal data. International transfers use appropriate safeguards such as Standard Contractual Clauses.</p>

        <h2>Retention</h2>
        <p>We keep personal data only for as long as necessary to handle your enquiry or as required by law, then delete or anonymise it.</p>

        <h2>Your rights</h2>
        <p>You have the right to access, correct, delete, restrict or object to processing, and the right to data portability. To exercise your rights, email <a href="mailto:info@chiefaa.com">info@chiefaa.com</a>.</p>

        <h2>Cookies and analytics</h2>
        <p>See our Cookies page for details. Analytics are disabled by default and load only after you choose “Accept all”. You can reset your choice by running <code>window.NexaReopenCookieBanner()</code>.</p>

        <h2>Contact</h2>
        <p>If you have questions, contact <a href="mailto:info@chiefaa.com">info@chiefaa.com</a>. You can also complain to the UK Information Commissioner’s Office (ICO) if unresolved.</p>
      </div>
    </div>
  );
}


