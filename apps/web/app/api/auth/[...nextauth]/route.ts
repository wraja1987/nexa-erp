import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import verifyCredentials from "../../../../src/lib/auth-credentials";
import { auditEvent } from "@/lib/observability/audit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Trust proxy host headers (Vercel/NGINX) to correctly compute callbacks
  trustHost: true,
  // Ensure the custom login page is used
  pages: { signIn: "/login" },
  // Explicit cookie options for clarity (functionally equivalent to defaults)
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://")
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !!process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith("https://"),
      },
    },
    callbackUrl: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://")
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !!process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith("https://"),
      },
    },
    csrfToken: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://")
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        // NextAuth's CSRF cookie must be readable by the browser (double-submit cookie pattern)
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: !!process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith("https://"),
      },
    },
  },
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
  events: {
    async signIn(message) {
      try {
        if (process.env.AUTH_AUDIT_ENABLED !== "true") return;
        await auditEvent("auth.sign_in", {
          tenantId: (message.user as any)?.tenantId ?? null,
          userId: (message.user as any)?.id ?? null,
          provider: message?.account?.provider ?? "credentials",
          ip: (message as any)?.ip ?? null,
          userAgent: (message as any)?.userAgent ?? null,
          at: new Date().toISOString(),
        });
      } catch {}
    },
    async signOut(message) {
      try {
        if (process.env.AUTH_AUDIT_ENABLED !== "true") return;
        await auditEvent("auth.sign_out", {
          tenantId: (message.session as any)?.user?.tenantId ?? null,
          userId: (message.session as any)?.user?.id ?? null,
          at: new Date().toISOString(),
        });
      } catch {}
    },
    async session({ session }) {
      try {
        if (process.env.AUTH_AUDIT_ENABLED !== "true") return;
        await auditEvent("auth.session", {
          tenantId: (session as any)?.user?.tenantId ?? null,
          userId: (session as any)?.user?.id ?? null,
          at: new Date().toISOString(),
        });
      } catch {}
    },
    async linkAccount({ user, account }) {
      try {
        if (process.env.AUTH_AUDIT_ENABLED !== "true") return;
        await auditEvent("auth.link_account", {
          tenantId: (user as any)?.tenantId ?? null,
          userId: (user as any)?.id ?? null,
          provider: account?.provider ?? null,
          at: new Date().toISOString(),
        });
      } catch {}
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
