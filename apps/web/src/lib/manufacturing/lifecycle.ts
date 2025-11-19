export type WorkOrderStatus = "planned" | "released" | "completed" | "cancelled";

export function canStart(status: WorkOrderStatus) {
  return status === "planned";
}

export function canComplete(status: WorkOrderStatus) {
  return status === "released";
}

export function canCancel(status: WorkOrderStatus) {
  return status === "planned" || status === "released";
}


