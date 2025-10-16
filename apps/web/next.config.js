const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Ensure alias object exists and add safe fallbacks
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    };
    return config;
  },
};

module.exports = nextConfig;
