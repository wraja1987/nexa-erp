import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import AzureAD from "next-auth/providers/azure-ad";
import { ENV } from "@/lib/env";

// Providers array, conditionally include OAuth providers only if envs are present
const providers: NextAuthOptions["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      // TODO: replace with real DB user lookup
      if (!credentials?.email || !credentials?.password) return null;
      // Accept any non-empty credentials for now
      return { id: "user-1", name: "Nexa User", email: credentials.email } as any;
    }
  })
];

// Add Google only if keys available
if (ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({ clientId: ENV.GOOGLE_CLIENT_ID, clientSecret: ENV.GOOGLE_CLIENT_SECRET }) as any);
}
// Add Azure AD only if keys available
if (ENV.AZURE_AD_CLIENT_ID && ENV.AZURE_AD_CLIENT_SECRET && ENV.AZURE_AD_TENANT_ID) {
  providers.push(
    AzureAD({
      clientId: ENV.AZURE_AD_CLIENT_ID,
      clientSecret: ENV.AZURE_AD_CLIENT_SECRET,
      tenantId: ENV.AZURE_AD_TENANT_ID
    }) as any
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: ENV.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
};

export default authOptions;
