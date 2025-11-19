export type PayrollConfig = {
  paye?: unknown;
  ni?: unknown;
  pension?: unknown;
};

export function calculatePayeeTax(_grossMinor: number, _config: PayrollConfig, _period: { start: Date; end: Date }): number {
  // Schema gap: no UK PAYE config in schema — return 0
  return 0;
}

export function calculateNi(_grossMinor: number, _config: PayrollConfig, _period: { start: Date; end: Date }): number {
  // Schema gap: no NI config — return 0
  return 0;
}

export function calculatePension(_grossMinor: number, _config: PayrollConfig, _period: { start: Date; end: Date }): number {
  // Schema gap: no pension config — return 0
  return 0;
}


