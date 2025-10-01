import type { NextApiResponse } from "next";

export type ApiError = {
  ok: false;
  code: string;
  message: string;
  details?: unknown;
};

export function sendError(res: NextApiResponse, code: string, message: string, status = 400, details?: unknown) {
  const body: ApiError = { ok: false, code, message, details };
  res.status(status).json(body);
}



