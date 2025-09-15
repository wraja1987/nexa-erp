/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Hashed static assets
      {
        source: '^/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API routes: no-store
      {
        source: '^/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // HTML/SSR catch-all
      {
        source: '^/(?!_next/.)',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

