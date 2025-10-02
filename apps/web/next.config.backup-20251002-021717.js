/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const path = require('path');

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
  typescript: { ignoreBuildErrors: true },
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
  // Help Next.js resolve the correct monorepo root to avoid stray lockfiles
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

const sentryWebpackOptions = {
  // Disable sourcemap upload/CLI during local builds unless explicitly configured
  sourcemaps: { disable: true },
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  disableLogger: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackOptions);

module.exports = {
  webpack: (config, { isServer, dev }) => {
    const disableE2E = !!process.env.LHCI_DISABLE_E2E || (process.env.NODE_ENV === "production" && !dev);
    if (disableE2E) {
      const webpack = require("webpack");
      // BROAD match: ANY module path containing /e2e/ (Windows and POSIX)
      const re = /[\/]e2e[\/].*$/;
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(re, require("path").resolve(__dirname, "scripts/_lhciEmptyPage.tsx")));
    }
    return config;
  },
  experimental: { outputFileTracingRoot: __dirname },
  outputFileTracingExcludes: {
    "*": [
      "**/apps/mobile/**",
      "**/packages/**/expo/**",
      "**/node_modules/expo*/**",
      "**/node_modules/@expo/**",
      "**/node_modules/metro*/**"
    ]
  },
  webpack: (config, { isServer, dev }) => {
    // During production builds or when LHCI_DISABLE_E2E=1, replace any /e2e/* page with a stub
    const disableE2E = !!process.env.LHCI_DISABLE_E2E || (process.env.NODE_ENV === "production" && !dev);
    if (disableE2E) {
      const webpack = require("webpack");
      const re = /(src[\/])?(pages|app)[\/]e2e[\/].*$/;
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(re, require("path").resolve(__dirname, "scripts/_lhciEmptyPage.tsx")));
    }
    return config;
  },};
