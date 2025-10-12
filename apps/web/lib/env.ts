export const ENV = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "production",
};
export default ENV;
