export function listSupportedOpenBankingProviders(): Array<{ id: string; name: string; status: "placeholder" | "disabled" }> {
  return [{ id: "truelayer", name: "TrueLayer", status: "placeholder" }];
}

export function startOpenBankingConnection(scope: { tenantId: string }, providerId: string): { url: string } {
  // Placeholder URL to represent redirect to provider consent screen
  return { url: `/banking/open-banking/connect/${providerId}?tenant=${encodeURIComponent(scope.tenantId)}` };
}

export function handleOpenBankingCallback(): never {
  throw Object.assign(new Error("open_banking_not_configured"), { code: 501 });
}


