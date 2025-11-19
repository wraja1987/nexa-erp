export type BinStockRow = { sku: string; warehouseId?: string | null; locationId?: string | null; qtyMinor: number };

export function aggregateByBin(rows: BinStockRow[]) {
  const key = (r: BinStockRow) => `${r.warehouseId || "null"}|${r.locationId || "null"}|${r.sku}`;
  const map = new Map<string, BinStockRow>();
  for (const r of rows) {
    const k = key(r);
    const prev = map.get(k);
    if (prev) prev.qtyMinor += r.qtyMinor;
    else map.set(k, { ...r });
  }
  return Array.from(map.values());
}


