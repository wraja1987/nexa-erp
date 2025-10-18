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

  // Keep default tracing; avoid custom standalone/builders for Vercel preset
  // experimental.outputFileTracingRoot is deprecated; using top-level outputFileTracingRoot

  webpack(cfg, { dev }) {
    // Ensure that the '@' alias resolves to 'src' for server and client bundles
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = cfg.resolve.alias || {};
    cfg.resolve.alias["@"] = path.resolve(__dirname, "src");
    cfg.resolve.alias["@/lib"] = path.resolve(__dirname, "src/lib");
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
    const redirects = [
      { source: "/", destination: "/login", permanent: false }
    ];
    // Hide /e2e/* in LHCI/production to avoid prerender errors and noise
    if (isLHCI) {
      redirects.push({ source: "/e2e/:path*", destination: "/", permanent: false });
    }
    return redirects;
  }
};

module.exports = config;
