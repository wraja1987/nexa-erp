import { api, SIMULATE } from "../lib/api";
import { mockGL } from "../mocks/data";
export type GlRow = { id:string; date:string; account:string; debit:number; credit:number; memo?:string };
export async function fetchGL(): Promise<GlRow[]>{
  if (SIMULATE) return mockGL;
  const { data } = await api.get("/api/finance/gl");
  return Array.isArray(data)? data : (data?.rows ?? []);
}
