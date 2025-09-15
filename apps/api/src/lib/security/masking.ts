import { Prisma } from "@prisma/client";

type Context = { role?: string };
const SENSITIVE = new Set(["national_insurance_no", "ssn", "card_pan"]);

function mask(v: any) {
  if (v == null) return v;
  return typeof v === "string" && v.length > 4 ? v.slice(0,2) + "••••" + v.slice(-2) : "••••";
}

export function maskingMiddleware(ctx: Context): Prisma.Middleware {
  return async (params, next) => {
    const res = await next(params);
    if (ctx.role && (ctx.role === "superadmin" || ctx.role === "compliance_officer")) return res;

    const scrub = (row: any) => {
      if (row && typeof row === "object") {
        for (const k of Object.keys(row)) if (SENSITIVE.has(k)) row[k] = mask(row[k]);
      }
      return row;
    };

    if (Array.isArray(res)) return res.map(scrub);
    return scrub(res);
  };
}




