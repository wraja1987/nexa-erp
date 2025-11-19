export type PoStatus = "draft" | "approved" | "sent" | "received" | "closed" | "cancelled";

export function canApprove(status: PoStatus) {
  return status === "draft";
}

export function canCancel(status: PoStatus) {
  return status === "draft" || status === "approved";
}


