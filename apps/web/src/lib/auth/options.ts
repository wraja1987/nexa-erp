import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(c) {
        const email = process.env.DEMO_EMAIL || "wraja1987@yahoo.co.uk";
        const pass  = process.env.DEMO_PASS  || "Wolfish123";
        if (c?.email === email && c?.password === pass) return { id: "nexa-demo", name: "Nexa Demo", email };
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-123",
};
