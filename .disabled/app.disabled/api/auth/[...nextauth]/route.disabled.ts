import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const allow = process.env.DEV_ALLOW_STATIC_LOGIN === "true";
const demoEmail = process.env.DEMO_EMAIL || "wraja1987@yahoo.co.uk";
const demoPass  = process.env.DEMO_PASS  || "Wolfish123";

export const { GET, POST } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!allow) throw new Error("Static login disabled");
        const email = (creds?.email ?? "").toString();
        const pass  = (creds?.password ?? "").toString();
        if (email.toLowerCase() === demoEmail.toLowerCase() && pass === demoPass) {
          return { id: "demo-user", name: "Demo User", email: demoEmail };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
});
