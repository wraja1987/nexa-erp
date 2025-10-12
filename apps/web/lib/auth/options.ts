import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

/**
 * Minimal, working Credentials provider so the login page functions.
 * Accept any non-empty email + password >= 3 chars.
 * Replace with your real user lookup when ready.
 */
const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credsSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
        });
        if (!parsed.success) return null;

        // TODO: replace with your real user lookup + password check
        // For now, allow sign-in with any valid email + 3+ char password.
        const { email } = parsed.data;
        return { id: email, name: email, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
};

export default authOptions;
