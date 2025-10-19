import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 10;

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role ?? "USER",
          tenant_id: (user as any).tenant_id ?? null
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).tenant_id = (user as any).tenant_id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).role = (token as any).role;
      (session as any).tenant_id = (token as any).tenant_id ?? null;
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        domain: ".nexaai.co.uk",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/"
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
