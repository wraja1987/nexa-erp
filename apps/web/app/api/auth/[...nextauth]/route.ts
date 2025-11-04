import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import verifyCredentials from "../../../../src/lib/auth-credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const user = await verifyCredentials(
          creds?.email ?? null,
          creds?.password ?? null
        );
        if (!user) return null;
        // the extra fields are copied into the JWT in the jwt() callback
        return { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role ?? null;
        (token as any).tenantId = (user as any).tenantId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role ?? null;
        (session.user as any).tenantId = (token as any).tenantId ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
