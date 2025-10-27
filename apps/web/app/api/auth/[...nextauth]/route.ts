import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { pool } from "@/lib/db";

const authOptions = {
  providers: [
    Credentials({
      name: "Nexa Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        const q = `
          SELECT id, email, role,
                 COALESCE("tenantId","tenant_id") AS "tenantId",
                 COALESCE("password_hash","password") AS "password_hash"
          FROM public."User"
          WHERE email = $1
          LIMIT 1
        `;
        const { rows } = await pool.query(q, [creds.email]);
        const user = rows[0];
        if (!user) return null;
        const ok = await compare(creds.password, user.password_hash);
        if (!ok) return null;
        return { id: String(user.id), email: user.email, role: user.role, tenantId: user.tenantId };
      }
    })
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role; token.tenantId = (user as any).tenantId; }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; (session.user as any).tenantId = token.tenantId; }
      return session;
    }
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
