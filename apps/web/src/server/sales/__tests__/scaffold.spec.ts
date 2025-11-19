import { describe, it, expect } from "vitest";
import * as quotes from "@/server/sales/quotes";
import * as orders from "@/server/sales/orders";
import * as q2o from "@/server/sales/quote-to-order";
import * as o2i from "@/server/sales/order-to-invoice";

describe("Sales scaffolding", () => {
  it("quotes exports exist", () => {
    expect(typeof quotes.listQuotes).toBe("function");
    expect(typeof quotes.getQuote).toBe("function");
  });
  it("orders exports exist", () => {
    expect(typeof orders.listOrders).toBe("function");
    expect(typeof orders.getOrder).toBe("function");
  });
  it("chains exports exist", () => {
    expect(typeof q2o.buildOrderFromQuotePreview).toBe("function");
    expect(typeof o2i.buildInvoiceFromOrderPreview).toBe("function");
  });
});


