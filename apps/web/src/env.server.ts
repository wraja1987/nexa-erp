import { z } from 'zod';

const EnvSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  EMAIL_FROM: z.string().email(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AZURE_AD_TENANT_ID: z.string().optional(),
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_AD_CLIENT_SECRET: z.string().optional(),
});

export const env = (() => {
  try {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success && process.env.NODE_ENV === 'production') {
      const messages = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      console.error('[env] Missing/invalid envs:', messages);
    }
    return process.env as unknown as z.infer<typeof EnvSchema>;
  } catch {
    return process.env as any;
  }
})();

export function describeAuthConfig() {
  const haveGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const haveAzure = !!(process.env.AZURE_AD_TENANT_ID && process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET);
  const haveSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  console.log('[auth] providers:', { email: haveSmtp, google: haveGoogle, azure_ad: haveAzure });
  return { email: haveSmtp, google: haveGoogle, azure_ad: haveAzure };
}



