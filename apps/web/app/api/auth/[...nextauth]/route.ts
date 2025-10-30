import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Nexa Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        const seeded = [
          { email: "super@nexa.ai", password: "ChangeMe!123", role: "SUPER_ADMIN" },
          { email: "info@nexaai.co.uk", password: "Wolfish123", role: "SUPER_ADMIN" },
          { email: "wraja1987@gmail.com", password: "Wolfish123", role: "ADMIN" },
        ];

        const user = seeded.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          return {
            id: email,
            name: email,
            email,
            role: user.role,
            tenantId: "default",
          };
        }

        // TODO: replace with Prisma lookup in db
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "USER";
        token.tenantId = (user as any).tenantId ?? "default";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).role = token.role;
        (session as any).tenantId = token.tenantId;
      }
      return session;
    },
  },
});
export { handler as GET, handler as POST };
