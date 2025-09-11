/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export compatible with Next.js 14+
  output: 'export',
  // Optional: ensure image handling falls back to static
  images: { unoptimized: true },
};

export default nextConfig;
