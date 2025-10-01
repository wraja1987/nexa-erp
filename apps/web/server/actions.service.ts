let _invoiceSeq = 1000;
let _poSeq = 5000;

export type CreateInvoiceInput = {
  customerId: string;
  date?: string;
  currency?: string;
  lines?: Array<{ sku: string; qty: number; price: number }>
};

export type CreatePOInput = {
  supplierId: string;
  date?: string;
  currency?: string;
  lines?: Array<{ sku: string; qty: number; price: number }>
};

export async function createInvoice(input: CreateInvoiceInput) {
  const id = "INV-" + (++_invoiceSeq);
  return { id, status: "DRAFT", ...input };
}

export async function createPO(input: CreatePOInput) {
  const id = "PO-" + (++_poSeq);
  return { id, status: "DRAFT", ...input };
}

export async function fetchInvoice(id: string) {
  return { id, status: "DRAFT" };
}

export async function fetchPO(id: string) {
  return { id, status: "DRAFT" };
}
