import { api, SIMULATE } from "../lib/api";
import { mockPOS } from "../mocks/data";
export async function createPI(amountMinor:number, currency="gbp"){
  if (SIMULATE) return mockPOS.create;
  const { data } = await api.post("/api/pos/payment-intents", { amount:amountMinor, currency });
  return data;
}
export async function capturePI(id:string){
  if (SIMULATE) return mockPOS.capture;
  const { data } = await api.post(`/api/pos/payment-intents/${id}/capture`, {});
  return data;
}
export async function refundPI(paymentId:string, amountMinor?:number){
  if (SIMULATE) return mockPOS.refund;
  const { data } = await api.post("/api/pos/refunds", { paymentId, amount: amountMinor });
  return data;
}
export async function getReconciliation(){
  if (SIMULATE) return mockPOS.reconciliation;
  const { data } = await api.get("/api/pos/reconciliation");
  return data;
}
