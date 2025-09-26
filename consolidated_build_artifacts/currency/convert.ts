export type ConvertOptions = { from: string; to: string; amount: number };
export async function convertCurrency(opts: ConvertOptions): Promise<number> {
  return opts.amount;
}
export default convertCurrency;
