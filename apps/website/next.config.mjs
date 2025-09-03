/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nexa/registry"],
  experimental: { tsconfigPaths: true, externalDir: true },
};
export default nextConfig;
