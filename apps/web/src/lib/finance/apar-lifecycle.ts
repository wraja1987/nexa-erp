export type InvoiceStatus = "draft" | "approved" | "sent" | "part_paid" | "paid" | "written_off" | "void";
export type BillStatus = "draft" | "approved" | "sent" | "part_paid" | "paid" | "void";

const invoiceTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["approved", "void"],
  approved: ["sent", "part_paid", "paid", "void"],
  sent: ["part_paid", "paid", "void"],
  part_paid: ["paid", "void"],
  paid: ["written_off", "void"],
  written_off: [],
  void: [],
};

const billTransitions: Record<BillStatus, BillStatus[]> = {
  draft: ["approved", "void"],
  approved: ["sent", "part_paid", "paid", "void"],
  sent: ["part_paid", "paid", "void"],
  part_paid: ["paid", "void"],
  paid: ["void"],
  void: [],
};

export function canTransitionInvoice(current: InvoiceStatus, next: InvoiceStatus): boolean {
  return (invoiceTransitions[current] || []).includes(next);
}

export function canTransitionBill(current: BillStatus, next: BillStatus): boolean {
  return (billTransitions[current] || []).includes(next);
}

export function nextStatusForInvoiceAfterPayment(current: InvoiceStatus, remainingMinor: number): InvoiceStatus {
  if (remainingMinor <= 0) return "paid";
  if (current === "approved" || current === "sent" || current === "part_paid") return "part_paid";
  return current;
}

export function nextStatusForBillAfterPayment(current: BillStatus, remainingMinor: number): BillStatus {
  if (remainingMinor <= 0) return "paid";
  if (current === "approved" || current === "sent" || current === "part_paid") return "part_paid";
  return current;
}


