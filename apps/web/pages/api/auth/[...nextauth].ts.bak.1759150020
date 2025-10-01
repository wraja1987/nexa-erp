import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  debug: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const allow = process.env.DEV_ALLOW_STATIC_LOGIN === "true";
        const email = process.env.DEMO_EMAIL ?? "demo@example.com";
        const pass  = process.env.DEMO_PASS  ?? "demo-password";
        if (allow && creds?.email === email && creds?.password === pass) {
          return { id: "demo", name: "Nexa Demo", email };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.user = user as any; return token; },
    async session({ session, token }) { if (token?.user) (session as any).user = token.user; return session; },
  },
};
export default NextAuth(authOptions);
