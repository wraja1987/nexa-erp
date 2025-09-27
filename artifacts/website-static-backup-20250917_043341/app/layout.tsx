export const metadata = { title: "Nexa ERP", description: "AI-powered ERP platform" };
import "./globals.css";

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
        <meta name="theme-color" content="#0B1D33"/>
        <meta name="description" content="Bring finance, operations and manufacturing together with governed access, full audit and actionable insights."/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
        <link rel="canonical" href="https://nexaai.co.uk/"/>
        <meta property="og:title" content="Nexa ERP — AI-powered ERP"/>
        <meta property="og:description" content="Finance, WMS, manufacturing and CRM — one secure, AI-assisted platform."/>
        <meta property="og:type" content="website"/><meta property="og:url" content="https://nexaai.co.uk/"/>
        <meta property="og:image" content="/images/hero-swirl.svg"/><meta name="twitter:card" content="summary_large_image"/>
      </head>
      <body>
        <div className="navwrap">
          <nav className="nav">
            <a href="/" aria-label="Nexa home" style={{display:'inline-flex',alignItems:'center',gap:8}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/nexa-logo.png" alt="Nexa" style={{height:42,width:'auto'}}/>
            </a>
            <div>
              <a href="/">Home</a>
              <a href="/products/">Products/Services</a>
              <a href="/pricing">Pricing</a>
              <a href="/about/">About Us</a>
              <a href="/resources/">Support/Resources</a>
              <a href="/integrations/">Integrations</a>
              <a href="/contact/">Contact</a>
              <a href="https://app.nexaai.co.uk/login" className="btn" aria-label="Nexa Customer Login">Login</a>
            </div>
          </nav>
        </div>
        {children}
        <footer>
          <div className="footer">
            <div className="fgrid">
              <div>
                <h4>Nexa ERP</h4>
                <p className="small">AI-powered finance, operations and manufacturing—built with clear controls and audit.</p>
                <p className="small">Contact: <a href="mailto:info@chiefaa.com">info@chiefaa.com</a> • +44 7398 975374</p>
              </div>
              <div>
                <h4>Product</h4>
                <div className="small"><a href="/products/">Overview</a></div>
                <div className="small"><a href="/pricing/">Pricing</a></div>
              </div>
              <div>
                <h4>Company</h4>
                <div className="small"><a href="/about/">About</a></div>
                <div className="small"><a href="/partners/">Partners</a></div>
                <div className="small"><a href="/status/">Status</a></div>
              </div>
              <div>
                <h4>Resources</h4>
                <div className="small"><a href="/resources/">Guides</a></div>
                <div className="small"><a href="/legal/">Legal & Compliance</a></div>
              </div>
            </div>
            <div className="fbottom">
              <div className="small">© <span id="yy"></span> Nexa ERP — All rights reserved.</div>
              <div className="small"><a href="/legal/">Legal</a> • <a href="/compliance/cookies/">Cookies</a> • <a href="/compliance/accessibility/">Accessibility</a></div>
              <script dangerouslySetInnerHTML={{__html:`document.getElementById("yy").textContent = new Date().getFullYear()`}}/>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
