export type RevenueResp = { ok:true; revenue:number };
export type GMResp = { ok:true; grossMargin:number|null; grossMarginPct:number|null; net:number };
export type InvoicesResp = {
  ok:true;
  counts: { status:string; count:number }[];
  list: { id:string; code:string|null; customerId:string; currency:string; status:string; total:number; createdAt:string }[];
};
export type WipResp = { ok:true; asOf:string; projects:any[] };
