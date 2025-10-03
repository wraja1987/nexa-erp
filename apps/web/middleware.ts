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
// removed invalid matcher
export default function middleware(req: NextRequest) {
  const nonce = genNonce();
  const url = new URL(req.url);
  const self = `${url.protocol}//${url.host}`;
  const origin = req.headers.get("origin") || "";

  const allowList = new Set([
    process.env.NEXT_PUBLIC_APP_ORIGIN || "",
    process.env.API_HOST || "",
  ].filter(Boolean));

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

  // CORS allowlist + preflight for API routes
  if (url.pathname.startsWith("/api/")) {
    if (req.method === "OPTIONS") {
      const preflight = new NextResponse(null, { status: 204 });
      preflight.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      preflight.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
      if (origin && allowList.has(origin)) preflight.headers.set("Access-Control-Allow-Origin", origin);
      preflight.headers.set("Access-Control-Allow-Credentials", "true");
      return preflight;
    }
    if (origin && allowList.size > 0 && !allowList.has(origin)) {
      return new NextResponse("Blocked by CORS policy", { status: 403 });
    }
  }

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", process.env.NEXT_PERMISSIONS_POLICY || "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=*, geolocation=(), gyroscope=(), hid=(), idle-detection=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=*, publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), usb=(), web-share=(), xr-spatial-tracking=()");
  res.headers.set("X-Nexa-Nonce", nonce);

  if (url.pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "no-store");
    if (origin && allowList.has(origin)) res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  else if (url.pathname.endsWith(".html") || !/\.[a-zA-Z0-9]+$/.test(url.pathname))
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  return res;
}


export const config = { matcher: '/:path*' };
