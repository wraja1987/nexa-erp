export default function LegalPage() {
  const links = [
    { href: '/compliance/privacy', label: 'Privacy Policy' },
    { href: '/compliance/cookies', label: 'Cookies' },
    { href: '/compliance/accessibility', label: 'Accessibility' },
    { href: '/compliance/security', label: 'Security & Compliance' },
  ];
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Legal</h1>
          <p className="mt-2 opacity-90">Find our key policies and compliance information for Nexa.</p>
        </div>
      </section>
      <div className="grid md:grid-cols-2 gap-6">
        {links.map(l => (
          <a key={l.href} href={l.href} className="card p-5 block hover:shadow-md transition">
            <h3 className="font-semibold">{l.label}</h3>
            <p className="text-slate-600 text-sm mt-1">Read the full policy and how we keep your data safe.</p>
          </a>
        ))}
      </div>
    </div>
  );
}



