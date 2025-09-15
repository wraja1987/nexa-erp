/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      { source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // HTML catch-all is set by middleware (safer than regex sources here)
    ];
  },
};
export default nextConfig;
