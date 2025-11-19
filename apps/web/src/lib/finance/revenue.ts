export type RevenueMode = "INSTANT" | "OVER_TIME_SIMPLE";

export function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function firstOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

export function monthsBetween(start: Date, end: Date): string[] {
  const s = firstOfMonth(start);
  const e = firstOfMonth(end);
  const keys: string[] = [];
  let cur = s;
  while (cur <= e) {
    keys.push(monthKey(cur));
    cur = addMonths(cur, 1);
  }
  return keys;
}

/**
 * Compute a simple revenue schedule.
 * - INSTANT: recognise full amount at invoice month
 * - OVER_TIME_SIMPLE: recognise evenly by month between issuedAt and dueAt; fallback to INSTANT if invalid range
 */
export function computeScheduleForDocument(
  totalMinor: number,
  issuedAt: Date,
  dueAt?: Date | null,
  mode?: RevenueMode
): Array<{ period: string; amountMinor: number }> {
  const chosen: RevenueMode =
    mode ||
    (dueAt && dueAt.getTime() > issuedAt.getTime() ? "OVER_TIME_SIMPLE" : "INSTANT");

  if (chosen === "INSTANT") {
    return [{ period: monthKey(issuedAt), amountMinor: totalMinor }];
  }

  if (!dueAt || dueAt.getTime() <= issuedAt.getTime()) {
    return [{ period: monthKey(issuedAt), amountMinor: totalMinor }];
  }

  const keys = monthsBetween(issuedAt, dueAt);
  if (keys.length === 0) return [{ period: monthKey(issuedAt), amountMinor: totalMinor }];
  const base = Math.floor(totalMinor / keys.length);
  let remainder = totalMinor - base * keys.length;
  return keys.map((k, idx) => {
    const add = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    return { period: k, amountMinor: base + add };
  });
}


