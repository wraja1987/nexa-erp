export type CostInput = { sku: string; qty: number };
export async function calculateCost(_input: CostInput): Promise<number> {
  return 0;
}
export const applyFifoCost = async (_: unknown): Promise<number> => 0;
export const averageCost = async (_: unknown): Promise<number> => 0;
export default calculateCost;
