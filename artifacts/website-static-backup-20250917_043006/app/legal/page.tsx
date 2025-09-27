export const metadata={title:"Legal • Nexa ERP",description:"Links to key legal and compliance information."};
export default function Legal(){return(<main className="container">
  <h1>Legal & Compliance</h1>
  <div className="grid grid-3">
    <a className="card" href="/compliance/privacy/"><h3>Privacy Policy</h3><p className="small">How we handle personal data (UK GDPR): what we collect, lawful bases, retention and your rights.</p></a>
    <a className="card" href="/compliance/cookies/"><h3>Cookies & PECR</h3><p className="small">Your cookie choices and analytics consent. Change your selection at any time.</p></a>
    <a className="card" href="/compliance/accessibility/"><h3>Accessibility</h3><p className="small">WCAG 2.2 AA commitment and support channels.</p></a>
    <a className="card" href="/compliance/security/"><h3>Security & Compliance</h3><p className="small">Controls, audit, SIEM, backups and disaster recovery. Responsible disclosure.</p></a>
  </div>
</main>);} 
