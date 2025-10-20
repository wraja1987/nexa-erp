import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim() || "";
        const password = credentials?.password || "";
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { email, active: true },
          select: { id: true, email: true, role: true, tenant_id: true, passwordHash: true },
        });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, role: user.role ?? "USER", tenant_id: user.tenant_id ?? null } as any;
      },
    }),
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
      session.user = (session.user || {}) as any;
      (session.user as any).id = (token as any).sub ?? (session.user as any).id ?? null;
      (session.user as any).email = (token as any).email ?? (session.user as any).email ?? null;
      (session.user as any).role = (token as any).role;
      (session.user as any).tenant_id = (token as any).tenant_id ?? null;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        domain: ".nexaai.co.uk",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },
  },
};
