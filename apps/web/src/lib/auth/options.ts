import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Env helpers: support both NEXTAUTH_* (v4) and AUTH_* (v5)
const ENV = {
  URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL,
  SECRET: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_SECURE: process.env.SMTP_SECURE,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GOOGLE_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AZURE_ID: process.env.AZURE_AD_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID,
  AZURE_SECRET: process.env.AZURE_AD_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET,
  AZURE_TENANT: process.env.AZURE_AD_TENANT_ID || process.env.MICROSOFT_TENANT_ID,
};

const providers = [
  EmailProvider({
    server: {
      host: ENV.SMTP_HOST!,
      port: Number(ENV.SMTP_PORT || 587),
      auth: { user: ENV.SMTP_USER!, pass: ENV.SMTP_PASS! },
      secure: ENV.SMTP_SECURE === "true",
    },
    from: ENV.EMAIL_FROM,
    maxAge: 15 * 60,
  }),
];

if (ENV.GOOGLE_ID && ENV.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: ENV.GOOGLE_ID!,
      clientSecret: ENV.GOOGLE_SECRET!,
    })
  );
}

if (ENV.AZURE_ID && ENV.AZURE_SECRET && ENV.AZURE_TENANT) {
  providers.push(
    AzureADProvider({
      clientId: ENV.AZURE_ID!,
      clientSecret: ENV.AZURE_SECRET!,
      tenantId: ENV.AZURE_TENANT!,
    })
  );
}

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  secret: ENV.SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
  },
  // TODO: copy any existing callbacks/pages/events from prior config if found
};
export default authOptions;
