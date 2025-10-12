import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email || "").toLowerCase();
        const password = creds?.password || "";

        // Temporary deterministic login so /login works now:
        const allowedEmail = (process.env.LOCAL_LOGIN_EMAIL || "").toLowerCase();
        const allowedPassword = process.env.LOCAL_LOGIN_PASSWORD || "";

        if (allowedEmail && allowedPassword && email === allowedEmail && password === allowedPassword) {
          return { id: "admin", name: "Admin", email };
        }
        return null;
      },
    }),
  ],
};
export default authOptions;
