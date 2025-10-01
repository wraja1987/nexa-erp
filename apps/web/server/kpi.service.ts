import crypto from "crypto";

export type KPI = {
  key: "revenue" | "grossMargin" | "invoices" | "wip";
  value: number;
  currency?: string;
  unit?: string;
  asOf: string; // ISO
  meta?: Record<string, any>;
};

export async function fetchRevenue(): Promise<KPI> {
  return { key: "revenue", value: 254000, currency: "GBP", asOf: new Date().toISOString() };
}

export async function fetchGrossMargin(): Promise<KPI> {
  return { key: "grossMargin", value: 37.4, unit: "percent", asOf: new Date().toISOString() };
}

export async function fetchInvoices(): Promise<KPI> {
  return { key: "invoices", value: 128, unit: "count", asOf: new Date().toISOString() };
}

export async function fetchWIP(): Promise<KPI> {
  return { key: "wip", value: 73450, currency: "GBP", asOf: new Date().toISOString() };
}

export function makeEtag(body: unknown) {
  const s = typeof body === "string" ? body : JSON.stringify(body);
  return W/' + crypto.createHash(sha1).update(s).digest(hex) + ';
}
