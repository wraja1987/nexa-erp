// Phase 6 shims
export type VendorKey = "amazon"|"ebay"|"edi"|"health"|"shopify"|"hubspot"|"xero"|"sage";
export type IntegrationState = "connected"|"disconnected"|"error"|"pending"|"unknown";
export interface IntegrationStatus { vendor: VendorKey; state: IntegrationState; message?: string; updatedAt: string; meta?: Record<string,any>; }
export interface HealthProbe { name: string; ok: boolean; ts: string; details?: Record<string,any>; }
export interface Phase6Flags { amazon:boolean; ebay:boolean; edi:boolean; marketplace?:boolean; pos?:boolean; }
export const defaultPhase6: Phase6Flags = { amazon:false, ebay:false, edi:false, marketplace:false, pos:false };
export const makeStatus = (v:VendorKey, s:IntegrationState="unknown", msg?:string, meta?:Record<string,any>): IntegrationStatus =>
 ({ vendor:v, state:s, message:msg, updatedAt:new Date().toISOString(), meta });
