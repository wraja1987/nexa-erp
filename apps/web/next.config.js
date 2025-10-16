/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      { source: '/login', headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
        { key: 'Pragma', value: 'no-cache' }, { key: 'Expires', value: '0' },
      ]},
      { source: '/api/auth/:path*', headers: [ { key: 'Cache-Control', value: 'no-store' } ] },
    ];
  },
};
module.exports = nextConfig;