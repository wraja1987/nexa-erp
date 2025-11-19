export type QuoteStatus = string;

export function canEditQuote(_q: { status?: QuoteStatus }) {
  // Without a quote model, conservatively return false
  return false;
}

export function canDuplicateVersion() {
  // No version fields in schema
  return false;
}


