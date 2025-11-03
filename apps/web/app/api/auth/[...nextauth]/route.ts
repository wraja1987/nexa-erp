export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Credentials-only providers
const providers = [
  CredentialsProvider({
    name: "Nexa Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim();
      const password = credentials?.password;

      const seeded = [
        { email: "super@nexa.ai", password: "ChangeMe!123", role: "SUPER_ADMIN" },
        { email: "info@nexaai.co.uk", password: "Wolfish123", role: "SUPER_ADMIN" },
        { email: "wraja1987@gmail.com", password: "Wolfish123", role: "ADMIN" },
      ];

      const user = seeded.find((u) => u.email === email && u.password === password);
      if (user) {
        return { id: email, name: email, email, role: user.role, tenantId: "default" } as any;
      }
      return null;
    },
  }),
];

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }: any) {
      // Avoid loops on auth/public pages
      const publicPaths = [
        "/login",
        "/forgot-password",
        "/reset-password",
        "/api/auth",
      ];
      try {
        const next = typeof url === "string" ? url : "";
        if (publicPaths.some((p) => next === p || next.startsWith(p))) {
          return next.startsWith("http") ? next : `${baseUrl}${next}`;
        }
      } catch {}
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user }: any) {
      if (user) {
        (token as any).role = (user as any).role ?? "USER";
        (token as any).tenantId = (user as any).tenantId ?? "default";
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        (session as any).role = (token as any).role ?? "USER";
        (session as any).tenantId = (token as any).tenantId ?? "default";
      }
      return session;
    },
  },
  events: {
    async error(message: any) {
      console.error("[nextauth:error]", message);
    },
    signIn(message: any) {
      console.log("[auth][signIn]", message?.account?.provider || message);
    },
  },
  debug: true,
} as any;

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
