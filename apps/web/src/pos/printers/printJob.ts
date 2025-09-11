export type PrintPayload = { orderId: string; amount: number; currency: string; lines: string[] };
export type PrintResult = { ok: boolean; adapter: string; path?: string; message?: string };

export async function generateReceipt(payload: PrintPayload): Promise<string> {
  const header = `Nexa POS Receipt\nOrder: ${payload.orderId}\nTotal: ${payload.amount.toFixed(2)} ${payload.currency}\n`;
  return [header, ...payload.lines, "", "Thank you"].join("\n");
}


