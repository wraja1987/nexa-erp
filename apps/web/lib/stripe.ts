type PaymentIntent = { id: string; client_secret?: string; amount?: number; amount_received?: number };

export const stripe = {
  terminal: {
    connectionTokens: {
      async create(): Promise<{ secret: string }> {
        return { secret: "terminal_token_stub" };
      },
    },
  },
  paymentIntents: {
    async create(_args: any): Promise<PaymentIntent> {
      return { id: "pi_stub", client_secret: "pi_client_secret_stub", amount: _args?.amount };
    },
    async capture(_id: string, _opts?: any): Promise<PaymentIntent> {
      return { id: _id || "pi_stub", amount_received: _opts?.amount_to_capture ?? 0 };
    },
  },
  refunds: {
    async create(_args: any): Promise<{ id: string; amount?: number }> {
      return { id: "re_stub", amount: _args?.amount };
    },
  },
};

export default stripe;










