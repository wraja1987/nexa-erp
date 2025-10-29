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
  useSecureCookies: false,
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
        const schema = z.object({
          email: z.string().min(1),
          password: z.string().min(1),
        });
        const parsed = schema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        // 1) Try Prisma with camelCase fields that we know exist
        //    (DO NOT select tenantId here – it may not exist in this schema).
        const prismaUser = await (prisma as any).user?.findUnique?.({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
            passwordHash: true, // if your Prisma model maps password_hash -> passwordHash
          },
        });

        // 2) Fallback: if not found or missing hash, query snake_case directly
        let rowUser: any = null;
        if (!prismaUser || !prismaUser.passwordHash) {
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
          const r = rows?.[0];
          if (r) {
            rowUser = {
              id: r.id,
              email: r.email,
              name: r.name ?? "",
              role: r.role ?? "user",
              active: r.active ?? true,
              passwordHash: r.password_hash,
              tenantId: r.tenant_id ?? "root",
            };
          }
        }

        const u = (prismaUser
          ? {
              id: String(prismaUser.id),
              email: prismaUser.email,
              name: prismaUser.name ?? "",
              role: prismaUser.role ?? "user",
              active: prismaUser.active ?? true,
              passwordHash: prismaUser.passwordHash ?? null,
              tenantId: "root", // default if not in Prisma schema
            }
          : rowUser);

        if (!u || !u.active || !u.passwordHash) { console.log('[auth] credentials FAIL for', email); return null; }

        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) { console.log('[auth] credentials FAIL for', email); return null; }

        console.log('[auth] credentials OK for', email);
        return {
          id: String(u.id),
          email: u.email,
          name: u.name ?? "",
          role: u.role ?? "user",
          tenantId: u.tenantId ?? "root",
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = String((user as any).id ?? token.sub);
        token.email = (user as any).email ?? token.email;
        token.name = (user as any).name ?? token.name;
        (token as any).role = (user as any).role ?? (token as any).role ?? 'user';
        (token as any).tenantId = (user as any).tenantId ?? (token as any).tenantId ?? 'root';
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = {} as any;
      (session.user as any).id = token.sub ?? (session.user as any).id;
      session.user.email = (token.email as string) ?? session.user.email;
      session.user.name = (token.name as string) ?? session.user.name;
      (session.user as any).role = (token as any).role ?? (session.user as any).role ?? 'user';
      (session.user as any).tenantId = (token as any).tenantId ?? (session.user as any).tenantId ?? 'root';
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        const cb = u.searchParams.get('callbackUrl');
        if (cb) return cb.startsWith('http') ? cb : `${baseUrl}${cb}`;
      } catch {}
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + '/dashboard';
    },
  },
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
