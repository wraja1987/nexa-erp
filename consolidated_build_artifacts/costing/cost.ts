export type CostInput = { sku: string; qty: number };
export async function calculateCost(_input: CostInput): Promise<number> {
  return 0;
}
export default calculateCost;
