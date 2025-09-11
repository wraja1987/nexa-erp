import { promises as fs } from "fs";
import path from "path";
import { generateReceipt, type PrintPayload, type PrintResult } from "./printJob";

export async function printUSB(deviceId: string, payload: PrintPayload): Promise<PrintResult> {
  const output = await generateReceipt(payload);
  const filePath = path.join(process.cwd(), "Nexa ERP Backend", "reports", "prints", `usb-${payload.orderId}.txt`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, output, "utf8");
  return { ok: true, adapter: "USB", path: filePath };
}


