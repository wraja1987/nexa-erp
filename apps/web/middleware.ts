import { NextResponse, type NextRequest } from "next/server";

const SOFT_GUARD_PATHS = ["/finance/reports"];
const LOGIN_PATH = "/login";

function sentryIngestHostFromDSN(): string | null {
  try {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) return null;
    const url = new URL(dsn);
    return url.host || null;
  } catch {
    return null;
  }
}

function buildCSP(): string {
  const sentryHost = sentryIngestHostFromDSN();
  const connectSrc = [`'self'`];
  if (sentryHost) connectSrc.push(`https://${sentryHost}`);
  // Allow Stripe (Checkout + Portal)
  const scriptSrc = [`'self'`, "https://js.stripe.com"];
  const frameSrc = ["https://js.stripe.com", "https://checkout.stripe.com", "https://billing.stripe.com"];
  const imgSrc = [`'self'`, "data:"];
  const styleSrc = [`'self'`];
  const fontSrc = [`'self'`, "data:"];
  const baseUri = [`'self'`];
  const formAction = [`'self'`, "https://checkout.stripe.com"];

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src ${frameSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `base-uri ${baseUri.join(" ")}`,
    `form-action ${formAction.join(" ")}`
  ].join("; ");
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  // Core security headers
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set("X-Frame-Options", "DENY");
  // CSP
  res.headers.set("Content-Security-Policy", buildCSP());
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Never touch API routes or static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // Require login everywhere except the login page itself
  const isLoggedIn =
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (!isLoggedIn && pathname !== LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // IMPORTANT: let these routes fall through to the page.
  if (SOFT_GUARD_PATHS.some(p => pathname.startsWith(p))) {
    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|static|public).*)",
  ],
};
