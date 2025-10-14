import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const providers = [
  EmailProvider({
    server: {
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
      secure: process.env.SMTP_SECURE === "true",
    },
    from: process.env.EMAIL_FROM,
    maxAge: 15 * 60,
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

if (
  (process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID) &&
  (process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET) &&
  (process.env.MICROSOFT_TENANT_ID || process.env.AZURE_AD_TENANT_ID)
) {
  providers.push(
    AzureADProvider({
      clientId: (process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID)!,
      clientSecret: (process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET)!,
      tenantId: (process.env.MICROSOFT_TENANT_ID || process.env.AZURE_AD_TENANT_ID)!,
    })
  );
}

const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
  },
  // TODO: copy any existing callbacks/pages/events from prior config if found
};
export default authOptions;
