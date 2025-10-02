import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // Sentry will upload source maps instead
  // Sentry tunnel (prevents ad-blockers from blocking reports)
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    disableServerWebpackPlugin: false,
    disableClientWebpackPlugin: false,
  },
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|css|js|woff|woff2|ttf)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/(.*)", headers: [{ key: "Cache-Control", value: "s-maxage=60, stale-while-revalidate=300" }] },
    ];
  },
};

const sentryWebpackOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: process.env.SENTRY_RELEASE, // computed in build step
  // Upload source maps for server + client
  sourcemaps: {
    assets: ["**/.next/static/chunks/**/*.js", "**/.next/static/css/**/*.css"],
    ignore: ["node_modules"],
    filesToDeleteAfterUpload: ["**/*.map"],
    uploadLegacySourcemaps: true,
  },
  // Keep logs quiet during build
  silent: true,
};

export default withSentryConfig(nextConfig, sentryWebpackOptions);
