import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    // 1) credentials — keep working path
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

        // seeded emails that must work even if tenantId was temporarily optional
        const seededEmails = [
          "super@nexa.ai",
          "info@nexaai.co.uk",
          "wraja1987@gmail.com",
        ];

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });

        if (!user) return null;

        // if user has a password hash, verify
        if (user.password) {
          const ok = await compare(credentials.password, user.password);
          if (!ok) return null;
        } else {
          // for seeded users without password hash, allow only known passwords
          if (
            seededEmails.includes(credentials.email) &&
            (credentials.password === "ChangeMe!123" ||
              credentials.password === "Wolfish123")
          ) {
            // pass
          } else {
            return null;
          }
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          tenantId: user.tenantId ?? null,
          role: user.role ?? "USER",
        };
      },
    }),

    // 2) google — must appear in /api/auth/providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // 3) microsoft / azure ad
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // allow credentials
      if (account?.provider === "credentials") {
        return true;
      }

      // allow google/microsoft for the seeded emails
      const seededEmails = [
        "super@nexa.ai",
        "info@nexaai.co.uk",
        "wraja1987@gmail.com",
      ];
      if (user?.email && seededEmails.includes(user.email)) {
        return true;
      }

      // otherwise block (avoids random google accounts)
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email as string;
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
