const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID || "",
  AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET || "",
  AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID || "",
  REDIS_URL: process.env.REDIS_URL || ""
};
export type Env = typeof env;
export const ENV = env;
export default env;
