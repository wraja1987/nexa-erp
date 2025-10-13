import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        // TODO: replace with real lookup & verify; return user object with id/email
        return { id: "user-1", email: creds.email as string };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  // TODO: copy any existing callbacks/pages/events from prior config if found
};
export default authOptions;
