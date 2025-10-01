import { z } from "zod";
export const RangeQ = z.object({ from: z.string().optional(), to: z.string().optional() });
export const InvoicesQ = z.object({ status: z.enum(["DRAFT","POSTED","PAID"]).optional(), limit: z.coerce.number().int().min(1).max(200).default(50), offset: z.coerce.number().int().min(0).default(0) });
export const WipQ = z.object({ projectId: z.string().optional(), asOf: z.string().optional() });
