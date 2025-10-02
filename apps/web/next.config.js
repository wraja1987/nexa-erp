// Canonical Next.js config for Nexa web with LHCI gate.
// - Enforces AVIF/WebP
// - Ignores TS/ESLint in CI perf gate
// - Prevents monorepo tracing into mobile/Expo
// - Stubs ANY /e2e/* module for production/LHCI builds
// - Adds a production/LHCI redirect for /e2e/*

const path = require("path");
const isLHCI = !!process.env.LHCI_DISABLE_E2E || process.env.NODE_ENV === "production";

/** @type {import(next).NextConfig} */
const config = {
  images: { formats: ["image/avif","image/webp"] },

  // Keep perf gate independent of type/lint errors
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  },

  // Stop output file tracing from crawling the monorepo (Expo/mobile)
  outputFileTracingRoot: __dirname,
  outputFileTracingExcludes: {
    "*": [
      "**/apps/mobile/**",
      "**/packages/**/expo/**",
      "**/node_modules/expo*/**",
      "**/node_modules/@expo/**",
      "**/node_modules/metro*/**"
    ]
  },
  // experimental.outputFileTracingRoot is deprecated; using top-level outputFileTracingRoot

  webpack(cfg, { dev }) {
    if (isLHCI && !dev) {
      const webpack = require("webpack");
      // Broad match: ANY module path containing /e2e/
      const re = /[\/]e2e[\/] .*$/;
      cfg.plugins = cfg.plugins || [];
      cfg.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          re,
          path.resolve(__dirname, "scripts/_lhciEmptyPage.tsx")
        )
      );
    }
    return cfg;
  },

  async redirects() {
    // Hide /e2e/* in LHCI/production to avoid prerender errors and noise
    if (isLHCI) {
      return [
        { source: "/e2e/:path*", destination: "/", permanent: false }
      ];
    }
    return [];
  }
};

module.exports = config;
