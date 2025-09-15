/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // 1) Hashed static assets
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // 2) All API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // 3) HTML/SSR pages (everything except _next/*)
      {
        source: '/((?!(?:_next/)).*)',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

