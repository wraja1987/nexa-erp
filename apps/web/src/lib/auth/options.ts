import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";
import AzureAD from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

// Accept SMTP_* and EMAIL_SERVER_* names
const EMAIL_HOST = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
const EMAIL_PORT = Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || 0);
const EMAIL_USER = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
const EMAIL_PASS = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
const EMAIL_FROM = (process.env.EMAIL_FROM || "").trim();

const hasEmail = !!(EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS && EMAIL_FROM);
const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasAzure  = !!(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  // Force the sign-in UI to our /login page
  pages: { signIn: "/login", verifyRequest: "/auth/verify-request", error: "/login" },
  session: { strategy: "jwt" },
  // Normalise redirects to production base URL
  callbacks: {
    async redirect({ url, baseUrl }) {
      const prod = process.env.NEXTAUTH_URL || baseUrl;
      try {
        const parsed = new URL(url, baseUrl);
        if (parsed.origin === baseUrl || url.startsWith("/")) {
          return `${prod}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
      } catch {}
      return prod;
    },
  },
  providers: [
    hasEmail ? EmailProvider({
      server: {
        host: EMAIL_HOST!,
        port: EMAIL_PORT || 465,
        auth: { user: EMAIL_USER!, pass: EMAIL_PASS! },
        secure: (process.env.SMTP_SECURE === "true") || (EMAIL_PORT === 465),
      },
      from: EMAIL_FROM!,
      maxAge: 24 * 60 * 60,
    }) : null,
    hasGoogle ? Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }) : null,
    hasAzure ? AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }) : null,
  ].filter(Boolean) as any,
};
