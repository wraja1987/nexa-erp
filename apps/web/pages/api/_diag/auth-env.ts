import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const v = (s?: string | null) => (s && s.length ? true : false);
  res.status(200).json({
    NEXTAUTH_URL: v(process.env.NEXTAUTH_URL),
    AUTH_URL: v(process.env.AUTH_URL),
    NEXTAUTH_SECRET: v(process.env.NEXTAUTH_SECRET),
    AUTH_SECRET: v(process.env.AUTH_SECRET),
    EMAIL_FROM: v(process.env.EMAIL_FROM),
    SMTP_HOST: v(process.env.SMTP_HOST),
    SMTP_PORT: v(process.env.SMTP_PORT),
    SMTP_USER: v(process.env.SMTP_USER),
    SMTP_PASS: v(process.env.SMTP_PASS),
    SMTP_SECURE: v(process.env.SMTP_SECURE),
    GOOGLE_CLIENT_ID: v(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: v(process.env.GOOGLE_CLIENT_SECRET),
    AZURE_AD_CLIENT_ID: v(process.env.AZURE_AD_CLIENT_ID),
    AZURE_AD_CLIENT_SECRET: v(process.env.AZURE_AD_CLIENT_SECRET),
    AZURE_AD_TENANT_ID: v(process.env.AZURE_AD_TENANT_ID),
    node: process.version,
  });
}



