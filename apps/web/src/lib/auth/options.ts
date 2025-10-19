import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        return ok && user.active ? { id: user.id, email: user.email } : null;
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        domain: ".nexaai.co.uk",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
      },
    },
  },
  pages: { signIn: "/login" },
};
