import { describe, it, expect } from "vitest";
import { printLAN } from "../src/pos/printers/adapter.lan";
import { printUSB } from "../src/pos/printers/adapter.usb";
import { printBT } from "../src/pos/printers/adapter.bt";

const sample = { orderId: `TEST-${Date.now()}`, amount: 12.34, currency: "GBP", lines: ["Item A 1 x 10.00", "VAT 20% 2.34"] };

describe("POS Printer adapters", () => {
  it("LAN prints to file", async () => {
    const res = await printLAN("127.0.0.1", sample);
    expect(res.ok).toBe(true);
    expect(res.path).toBeTruthy();
  });
  it("USB prints to file", async () => {
    const res = await printUSB("usb-001", sample);
    expect(res.ok).toBe(true);
    expect(res.path).toBeTruthy();
  });
  it("Bluetooth prints to file", async () => {
    const res = await printBT("00:11:22:33:44:55", sample);
    expect(res.ok).toBe(true);
    expect(res.path).toBeTruthy();
  });
});


