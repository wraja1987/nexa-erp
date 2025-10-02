
import type { ReactNode } from "react";
import { headers } from "next/headers";
import Script from "next/script";

function getCspNonce(): string | undefined {
  try {
    const h = headers();
    const v = h.get("x-nexa-nonce") || h.get("x-nonce");
    return v || undefined;
  } catch { return undefined; }
}

import './globals.css';
import { inter } from '@/lib/fonts';
export const metadata = { title: 'Nexa', description: 'ERP' };
export default function RootLayout(props:any){
  return (
    <html lang="en-GB" lang="en-GB">
      <body className={inter.className}>
  {/* Example Script usage with nonce so it passes CSP */}
  <Script id="nexa-bootstrap" nonce={getCspNonce()} strategy="afterInteractive">{``}</Script>
  {props.children}
  </body>
    </html>
  );
}
