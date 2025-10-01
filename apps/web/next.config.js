/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const securityHeaders = async () => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://app.nexaai.co.uk https://www.googleapis.com https://login.microsoftonline.com https://graph.microsoft.com https://accounts.google.com https://oauth2.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  if (process.env.NEXA_DISABLE_UPGRADE_INSECURE !== '1') {
    cspDirectives.push('upgrade-insecure-requests');
  }
  const csp = cspDirectives.join('; ');
  return [{
    source: '/:path*',
    headers: [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
};

const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
    NEXT_PUBLIC_POS_DEFAULT_TAX_RATE: process.env.NEXT_PUBLIC_POS_DEFAULT_TAX_RATE,
    NEXT_PUBLIC_POS_ALLOW_OFFLINE: process.env.NEXT_PUBLIC_POS_ALLOW_OFFLINE,
  },
  eslint: { ignoreDuringBuilds: true },
  async headers() { if (process.env.LOCAL_LH==='1') return []; return securityHeaders(); },
  async rewrites() {
    if (process.env.E2E_MODE === '1') {
      return [{ source: '/dashboard', destination: '/e2e/dashboard' }];
    }
    return [];
  },
  reactStrictMode: true,
  images: { formats: ['image/avif','image/webp'] },
  output: 'standalone',
};

module.exports = withSentryConfig(nextConfig, { silent: true, disableLogger: true });
