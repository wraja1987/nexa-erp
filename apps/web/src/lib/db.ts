import { Pool } from "pg";
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) throw new Error("DATABASE_URL missing");
const needsSSL = /sslmode=require/i.test(connectionString) || /neon\.tech/.test(connectionString);
export const pool = new Pool({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});
