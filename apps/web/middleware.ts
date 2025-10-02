import { NextRequest, NextResponse } from "next/server";

function genNonce(): string {
  try {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    let binary = "";
    for (const byte of arr) binary += String.fromCharCode(byte);
    // btoa is available in many edge runtimes; if not, fallback to hex/uuid
    // @ts-ignore
    if (typeof btoa === "function") return btoa(binary);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback to UUID without dashes
    // @ts-ignore
    return (crypto.randomUUID?.() || "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx").replace(/-/g, "");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map)).*)"],
};

export default function middleware(req: NextRequest) {
  const nonce = genNonce();
  const url = new URL(req.url);
  const self = `${url.protocol}//${url.host}`;

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${(process.env.NEXT_PUBLIC_CSP_STRIPE || "").trim()} ${(process.env.NEXT_PUBLIC_CSP_SENTRY || "").trim()}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${(process.env.NEXT_PUBLIC_CSP_STRIPE || "").trim()} ${(process.env.NEXT_PUBLIC_CSP_SENTRY || "").trim()}`,
    "frame-ancestors 'none'",
    `frame-src ${(process.env.NEXT_PUBLIC_CSP_STRIPE || "").trim()}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; ");

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", process.env.NEXT_PERMISSIONS_POLICY || "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), hid=(), idle-detection=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=*, publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), usb=(), web-share=(), xr-spatial-tracking=()");
  res.headers.set("X-Nexa-Nonce", nonce);

  if (url.pathname.startsWith("/api/")) res.headers.set("Cache-Control", "no-store");
  else if (url.pathname.endsWith(".html") || !/\.[a-zA-Z0-9]+$/.test(url.pathname))
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  return res;
}
