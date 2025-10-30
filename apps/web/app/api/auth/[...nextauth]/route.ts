import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Nexa Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        const seededPasswords: Record<string, string> = {
          "super@nexa.ai": "ChangeMe!123",
          "info@nexaai.co.uk": "Wolfish123",
          "wraja1987@gmail.com": "Wolfish123",
        };

        // Allow seeded accounts with known passwords regardless of bcrypt result
        const user = await prisma.user.findFirst({ where: { email } });
        if (seededPasswords[email] && password === seededPasswords[email]) {
          if (user) {
            return {
              id: user.id,
              name: user.name ?? user.email,
              email: user.email,
              // @ts-expect-error optional fields
              tenantId: user.tenantId ?? null,
              // @ts-expect-error optional fields
              role: user.role ?? "USER",
            };
          }
          return {
            id: email,
            name: email,
            email,
            // @ts-expect-error optional fields
            tenantId: null,
            // @ts-expect-error optional fields
            role: "USER",
          };
        }

        // Fallback to DB verification
        if (!user) return null;
        if (user.password) {
          const ok = await compare(password, user.password);
          if (!ok) return null;
        } else {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          // @ts-expect-error optional fields
          tenantId: user.tenantId ?? null,
          // @ts-expect-error optional fields
          role: user.role ?? "USER",
        };
      },
    }),

    // Google and Azure AD providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
    }),
  ],
  callbacks: {
    redirect() {
      return "/dashboard";
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = (user as any).email;
        // @ts-expect-error
        if ((user as any).tenantId) token.tenantId = (user as any).tenantId;
        // @ts-expect-error
        if ((user as any).role) token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        // @ts-expect-error
        session.user.tenantId = (token as any).tenantId ?? null;
        // @ts-expect-error
        session.user.role = (token as any).role ?? "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
export { handler as GET, handler as POST };
