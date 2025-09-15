export default function AccessibilityPage() {
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Accessibility</h1>
          <p className="mt-2 opacity-90">We aim for WCAG 2.2 AA. If you find barriers, tell us at info@chiefaa.com.</p>
        </div>
      </section>
      <div className="prose max-w-none">
        <h2>What we do</h2>
        <ul>
          <li>Use semantic HTML, labels and headings correctly.</li>
          <li>Provide visible focus outlines and keyboard navigation.</li>
          <li>Check colour contrast and provide alt text for images.</li>
          <li>Test with screen readers and automated audits.</li>
        </ul>

        <h2>How to get help</h2>
        <p>Contact us if you need information in a different format or run into an issue. We will respond promptly with a fix or a reasonable alternative.</p>
      </div>
    </div>
  );
}


