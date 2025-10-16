import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

// Accept SMTP_* OR EMAIL_SERVER_* naming
const EMAIL_HOST = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
const EMAIL_PORT = Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || 0);
const EMAIL_USER = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
const EMAIL_PASS = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM;

const hasEmail = !!(EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS && EMAIL_FROM);
const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasAzure  = !!(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID);

export const authOptions: NextAuthOptions = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/auth/verify-request",
  },
  session: { strategy: "jwt" },
  providers: [
    hasEmail ? EmailProvider({
      server: {
        host: EMAIL_HOST!,
        port: EMAIL_PORT || 465,
        auth: { user: EMAIL_USER!, pass: EMAIL_PASS! },
        secure: (process.env.SMTP_SECURE === "true") || (EMAIL_PORT === 465),
      },
      from: EMAIL_FROM!,
    }) : null,
    hasGoogle ? GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }) : null,
    hasAzure ? AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }) : null,
  ].filter(Boolean) as any,
};
