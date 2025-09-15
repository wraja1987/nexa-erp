import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
    NEXT_PUBLIC_POS_DEFAULT_TAX_RATE: process.env.NEXT_PUBLIC_POS_DEFAULT_TAX_RATE,
    NEXT_PUBLIC_POS_ALLOW_OFFLINE: process.env.NEXT_PUBLIC_POS_ALLOW_OFFLINE,
  },
  eslint: {
    // Allow build to proceed during CI audits; lint runs separately in the chain
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

export default nextConfig;
