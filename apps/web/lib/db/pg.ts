import { Pool } from "pg";
const url = process.env.DATABASE_URL || "postgres://nexa_user:StrongPass123@127.0.0.1:5432/nexa";
export const pg = new Pool({ connectionString: url, max: 5 });
