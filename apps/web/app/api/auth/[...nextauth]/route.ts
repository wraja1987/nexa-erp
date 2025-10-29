import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = (globalThis as any).__prisma ?? new PrismaClient();
if (!(globalThis as any).__prisma) (globalThis as any).__prisma = prisma;

export const authOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  debug: false,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Nexa Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      authorize: async (credentials) => {
        const parsed = z.object({ email: z.string().min(1), password: z.string().min(1) }).safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        // Try Prisma model mapping (camelCase)
        const u1 = await (prisma as any).user?.findUnique?.({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
            passwordHash: true, // if your schema maps snake_case to camelCase
          },
        });

        // Fallback to raw snake_case
        let u = u1 as any;
        if (!u) {
          const rows = await prisma.$queryRaw<Array<{
            id: string;
            email: string;
            name: string | null;
            role: string | null;
            active: boolean | null;
            password_hash: string | null;
            tenant_id: string | null;
          }>>`
            SELECT id, email, name, role, active, password_hash, tenant_id
            FROM "User"
            WHERE lower(email) = ${email}
            LIMIT 1
          `;
          const r = rows.at(0);
          if (r) {
            u = {
              id: r.id,
              email: r.email,
              name: r.name,
              role: r.role ?? "user",
              active: (r.active ?? true),
              passwordHash: r.password_hash,
              tenantId: r.tenant_id ?? "root",
            };
          }
        }

        if (!u || !u.active || !u.passwordHash) return null;
        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;

        return { id: String(u.id), email: u.email, name: u.name ?? "", role: u.role ?? "user", tenantId: u.tenantId ?? "root" };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      (session as any).user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        tenantId: token.tenantId,
      } as any;
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      try {
        const u = new URL(url, baseUrl);
        const cb = u.searchParams.get("callbackUrl");
        if (cb) return cb;
      } catch {}
      return "/dashboard";
    },
  },
} as const;

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
