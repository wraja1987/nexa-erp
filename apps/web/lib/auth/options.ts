import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        // Replace with real auth later. For now: any non-empty email+password succeeds.
        if (credentials?.email && credentials?.password) {
          return { id: "user-1", name: credentials.email, email: credentials.email };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
};
export default authOptions;
