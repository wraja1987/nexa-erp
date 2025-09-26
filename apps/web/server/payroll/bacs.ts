export type BacsPayment = { accountName:string; sortCode:string; accountNumber:string; amount:number; reference?:string };
export type BacsBatch = { payments:BacsPayment[]; createdAt:string; company?:string };
export async function generateBacsFile(batch:BacsBatch): Promise<string> {
  const header="Account Name,Sort Code,Account Number,Amount,Reference";
  const rows=batch.payments.map(p=>[p.accountName,p.sortCode,p.accountNumber,p.amount.toFixed(2),p.reference||""].join(","));
  return [header, ...rows].join("\n");
}
export default generateBacsFile;
export const toBacsCsv = generateBacsFile;
