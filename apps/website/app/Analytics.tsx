"use client";

import Script from "next/script";

const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN || process.env.PLAUSIBLE_DOMAIN;
const consent = process.env.NEXT_PUBLIC_ANALYTICS_CONSENT === "true";

export default function Analytics() {
  if (!consent || !domain) return null;
  return (
    <>
      {/* Plausible script (loads only after consent) */}
      <Script
        src="https://plausible.io/js/script.js"
        data-domain={domain}
        strategy="afterInteractive"
      />
    </>
  );
}
