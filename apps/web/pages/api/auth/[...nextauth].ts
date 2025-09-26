import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email ?? "";
        const password = credentials?.password ?? "";
        const demoEmail = process.env.DEMO_EMAIL ?? "";
        const demoPass  = process.env.DEMO_PASS  ?? "";
        const allowed   = process.env.DEV_ALLOW_STATIC_LOGIN === "true";
        if (allowed && email === demoEmail && password === demoPass) {
          return { id: "nexa-demo", name: "Nexa Demo", email };
        }
        return null;
      }
    })
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
