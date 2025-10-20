import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 10;

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  debug: false,
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
        try {
          const schema = z.object({ email: z.string().min(1), password: z.string().min(1) });
          const { email, password } = schema.parse({ email: credentials?.email, password: credentials?.password });
          const normalizedEmail = email.toLowerCase();

          const user = await prisma.user.findFirst({
            where: { email: normalizedEmail, active: true },
            select: { id: true, email: true, role: true, tenant_id: true, passwordHash: true },
          });
          if (!user || !user.passwordHash) return null;

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          return { id: user.id, email: user.email, role: user.role ?? "USER", tenant_id: user.tenant_id ?? null } as any;
        } catch (err) {
          console.error('[auth/credentials]', err);
          return null;
        }
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
      // Ensure required keys on session.user
      session.user = (session.user || {}) as any;
      (session.user as any).id = (token as any).sub ?? (session.user as any).id ?? null;
      (session.user as any).email = (token as any).email ?? (session.user as any).email ?? null;
      (session.user as any).role = (token as any).role;
      (session.user as any).tenant_id = (token as any).tenant_id ?? null;
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
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
