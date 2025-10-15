import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createTransporter } from "@/lib/email/transporter";
import "@/env.server";

// Env helpers: support both NEXTAUTH_* (v4) and AUTH_* (v5)
const ENV = {
  URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL,
  SECRET: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_SECURE: process.env.SMTP_SECURE,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GOOGLE_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AZURE_ID: process.env.AZURE_AD_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID,
  AZURE_SECRET: process.env.AZURE_AD_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET,
  AZURE_TENANT: process.env.AZURE_AD_TENANT_ID || process.env.MICROSOFT_TENANT_ID,
};

const providers = [
  EmailProvider({
    from: ENV.EMAIL_FROM,
    maxAge: 15 * 60,
    async sendVerificationRequest({ identifier, url, provider }) {
      const transporter = createTransporter();
      const result = await transporter
        .sendMail({
          to: identifier,
          from: provider.from ?? ENV.EMAIL_FROM!,
          subject: `Sign in to ${new URL(url).host}`,
          text: `Sign in to ${new URL(url).host}: ${url}`,
          html: `<p>Click the button to sign in:</p>
                 <p><a href="${url}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Sign in</a></p>
                 <p>Or copy and paste this URL: <br>${url}</p>`,
        })
        .catch((err: any) => {
          console.error("[email] sendMail error:", err?.message || err);
          throw new Error(`Email transport failed: ${err?.message || "unknown error"}`);
        });
      if ((result as any)?.rejected?.length) {
        const msg = `Email rejected: ${(result as any).rejected.join(", ")}`;
        console.error("[email] rejected:", msg);
        throw new Error(msg);
      }
    },
  }),
];


if (ENV.AZURE_ID && ENV.AZURE_SECRET && ENV.AZURE_TENANT) {
  providers.push(
    AzureADProvider({
      id: 'azure-ad',
      tenantId: ENV.AZURE_TENANT!,
      clientId: ENV.AZURE_ID!,
      clientSecret: ENV.AZURE_SECRET!,
      authorization: { params: { scope: "openid email profile offline_access User.Read" } },
      checks: ["pkce", "state"],
    })
  );
}

if (ENV.GOOGLE_ID && ENV.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: ENV.GOOGLE_ID!,
      clientSecret: ENV.GOOGLE_SECRET!,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
      checks: ["pkce", "state"],
      profile(profile) { return profile as any; },
      allowDangerousEmailAccountLinking: true,
      idToken: false,
      // scopes declared in params above plus provider default openid/email/profile
    })
  );
}

export const authOptions: NextAuthOptions = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers,
  secret: ENV.SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  logger: {
    error: (code, meta) => console.error("[NextAuth][error]", code, meta),
    warn: (code) => console.warn("[NextAuth][warn]", code),
    debug: (code, meta) => { if (process.env.NODE_ENV !== 'production') console.debug("[NextAuth][debug]", code, meta); },
  },
};
