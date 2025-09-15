export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Security & Compliance</h1>
          <p className="mt-2 opacity-90">How we protect your data: governance, security controls, observability and continuity.</p>
        </div>
      </section>
      <div className="prose max-w-none">
        <h2>Governance</h2>
        <ul>
          <li>Role‑Based Access Control with Segregation of Duties.</li>
          <li>MFA support.</li>
          <li>Comprehensive audit trails, including AI prompt/response audit.</li>
        </ul>

        <h2>Security</h2>
        <ul>
          <li>TLS in transit; secure headers and rate‑limiting at the edge.</li>
          <li>Secrets redaction in logs and structured masking for PII.</li>
          <li>Least‑privilege access for databases and services.</li>
        </ul>

        <h2>Observability & SIEM</h2>
        <p>Metrics and logs are available with export to SIEM for central monitoring.</p>

        <h2>Backups & DR</h2>
        <p>Regular backups and disaster recovery drills to validate recovery time and data integrity.</p>

        <h2>Responsible disclosure</h2>
        <p>If you believe you’ve found a security issue, email <a href="mailto:info@chiefaa.com">info@chiefaa.com</a>. We’ll investigate promptly.</p>
      </div>
    </div>
  );
}


