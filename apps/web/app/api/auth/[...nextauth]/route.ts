import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Nexa Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // 1) hard-known production accounts to unblock prod login
        const hardKnown: Record<
          string,
          {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantId: string;
            password: string;
          }
        > = {
          "super@nexa.ai": {
            id: "super-nexa-ai",
            name: "Super Admin",
            email: "super@nexa.ai",
            role: "superadmin",
            tenantId: "root",
            password: "ChangeMe!123",
          },
          "info@nexaai.co.uk": {
            id: "info-nexaai-co-uk",
            name: "Info Nexa",
            email: "info@nexaai.co.uk",
            role: "superadmin",
            tenantId: "root",
            password: "Wolfish123",
          },
          "wraja1987@gmail.com": {
            id: "wraja1987-gmail-com",
            name: "Admin",
            email: "wraja1987@gmail.com",
            role: "admin",
            tenantId: "root",
            password: "Wolfish123",
          },
        };

        const hk = hardKnown[email];
        if (hk && password === hk.password) {
          return {
            id: hk.id,
            name: hk.name,
            email: hk.email,
            role: hk.role,
            tenantId: hk.tenantId,
          };
        }

        // 2) fallback to DB user
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        if (!user) {
          throw new Error("User not found");
        }
        if (!user.password) {
          throw new Error("No password set");
        }

        const ok = await compare(password, user.password);
        if (!ok) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: (user as any).role ?? "user",
          tenantId: (user as any).tenantId ?? "root",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "user";
        token.tenantId = (user as any).tenantId ?? "root";
        token.name = (user as any).name ?? "";
        token.email = (user as any).email ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
        session.user.tenantId = (token.tenantId as string) ?? "root";
        session.user.name = (token.name as string) ?? "";
        session.user.email = (token.email as string) ?? "";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
export { handler as GET, handler as POST };
