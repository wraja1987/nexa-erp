import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['zod'],
  },
  transpilePackages: ['@nexa/registry'],
}

export default nextConfig
