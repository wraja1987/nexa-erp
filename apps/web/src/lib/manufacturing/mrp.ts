export type NetReqInput = {
  itemCode: string;
  demandQtyMinor: number;
  onHandQtyMinor: number;
};

export function calculateNetReqRows(rows: NetReqInput[]) {
  return rows.map((r) => ({
    itemCode: r.itemCode,
    demand: r.demandQtyMinor,
    onHand: r.onHandQtyMinor,
    netRequirement: Math.max(0, r.demandQtyMinor - r.onHandQtyMinor),
  }));
}


