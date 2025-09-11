import { promises as fs } from "fs";
import path from "path";
import { generateReceipt, type PrintPayload, type PrintResult } from "./printJob";

export async function printLAN(host: string, payload: PrintPayload): Promise<PrintResult> {
  const output = await generateReceipt(payload);
  const filePath = path.join(process.cwd(), "Nexa ERP Backend", "reports", "prints", `lan-${payload.orderId}.txt`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, output, "utf8");
  return { ok: true, adapter: "LAN", path: filePath };
}


