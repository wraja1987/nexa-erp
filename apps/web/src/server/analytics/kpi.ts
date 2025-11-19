/**
 * Phase 11 — KPI Services
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { getCashPosition } from "@/server/banking/cash";
import { listUnreconciledBankTransactions } from "@/server/banking/reconciliation";

type Scope = { tenantId: string; entityId?: string | null };

export async function getFinanceKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const ar = await prisma.customerInvoice.aggregate({
      where: { tenantId: scope.tenantId },
      _sum: { total: true },
      _count: true,
    });
    const ap = await prisma.supplierBill.aggregate({
      where: { tenantId: scope.tenantId },
      _sum: { total: true },
      _count: true,
    });
    return {
      supported: true,
      kpis: {
        arTotal: Number(ar._sum.total || 0),
        arCount: ar._count,
        apTotal: Number(ap._sum.total || 0),
        apCount: ap._count,
      },
    };
  } catch {
    return { supported: false, message: "error computing finance KPIs", kpis: {} };
  }
}

export async function getBankingKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const cash = await getCashPosition(scope.tenantId);
    const unrecon = await listUnreconciledBankTransactions(scope.tenantId);
    return {
      supported: true,
      kpis: {
        cashTotal: cash?.total || 0,
        unreconciledCount: Array.isArray(unrecon) ? unrecon.length : 0,
      },
    };
  } catch {
    return { supported: false, message: "error computing banking KPIs", kpis: {} };
  }
}

export async function getHrKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const employees = await prisma.employee.count({ where: { tenantId: scope.tenantId } });
    const payrollRuns = await prisma.payrollRun.count({ where: { tenantId: scope.tenantId } });
    return { supported: true, kpis: { employees, payrollRuns } };
  } catch {
    return { supported: false, message: "error computing HR KPIs", kpis: {} };
  }
}

export async function getInventoryKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const skuCount = await prisma.inventoryItem.count({ where: { tenantId: scope.tenantId } });
    const byWh = await prisma.inventoryItem.groupBy({
      by: ["warehouseId"],
      where: { tenantId: scope.tenantId },
      _sum: { qtyOnHand: true },
    });
    const totalQty = byWh.reduce((s, r) => s + Number(r._sum.qtyOnHand || 0), 0);
    return { supported: true, kpis: { skuCount, totalQty, warehouses: byWh.length } };
  } catch {
    return { supported: false, message: "error computing inventory KPIs", kpis: {} };
  }
}

export async function getManufacturingKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const total = await prisma.workOrder.count({ where: { tenantId: scope.tenantId } });
    const open = await prisma.workOrder.count({ where: { tenantId: scope.tenantId, status: { in: ["planned", "released"] as any } } });
    return { supported: true, kpis: { workOrders: total, openWorkOrders: open } };
  } catch {
    return { supported: false, message: "error computing manufacturing KPIs", kpis: {} };
  }
}

export async function getPurchasingKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const orders = await prisma.purchaseOrder.count({ where: { tenantId: scope.tenantId } });
    const draft = await prisma.purchaseOrder.count({ where: { tenantId: scope.tenantId, status: "draft" as any } });
    return { supported: true, kpis: { purchaseOrders: orders, draftPurchaseOrders: draft } };
  } catch {
    return { supported: false, message: "error computing purchasing KPIs", kpis: {} };
  }
}

export async function getProjectsKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const projects = await prisma.project.count({ where: { tenantId: scope.tenantId } });
    const activeProjects = await prisma.project.count({ where: { tenantId: scope.tenantId, status: "active" } });
    const timesheets = await prisma.timesheet.count({ where: { tenantId: scope.tenantId } });
    const totalHours = await prisma.timesheet.aggregate({
      where: { tenantId: scope.tenantId },
      _sum: { hours: true },
    });
    return {
      supported: true,
      kpis: {
        projects,
        activeProjects,
        timesheets,
        totalHours: Number(totalHours._sum.hours || 0),
      },
    };
  } catch {
    return { supported: false, message: "error computing projects KPIs", kpis: {} };
  }
}

export async function getSalesKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const quotes = await prisma.salesQuote.count({ where: { tenantId: scope.tenantId } });
    const orders = await prisma.salesOrder.count({ where: { tenantId: scope.tenantId } });
    const orderTotal = await prisma.salesOrder.aggregate({
      where: { tenantId: scope.tenantId },
      _sum: { total: true },
    });
    const customers = await prisma.customer.count({ where: { tenantId: scope.tenantId } });
    return {
      supported: true,
      kpis: {
        quotes,
        orders,
        orderTotal: Number(orderTotal._sum.total || 0),
        customers,
      },
    };
  } catch {
    return { supported: false, message: "error computing sales KPIs", kpis: {} };
  }
}

export async function getPosKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const sales = await prisma.posSale.count({ where: { tenantId: scope.tenantId } });
    const salesTotal = await prisma.posSale.aggregate({
      where: { tenantId: scope.tenantId },
      _sum: { total: true },
    });
    const payments = await prisma.posPayment.aggregate({
      where: { tenantId: scope.tenantId },
      _sum: { amount: true },
      _count: true,
    });
    return {
      supported: true,
      kpis: {
        salesCount: sales,
        salesTotal: Number(salesTotal._sum.total || 0),
        paymentCount: payments._count,
        paymentTotal: Number(payments._sum.amount || 0),
      },
    };
  } catch {
    return { supported: false, message: "error computing POS KPIs", kpis: {} };
  }
}

export async function getTaxKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    const vatReturns = await prisma.vatReturn.count({ where: { tenantId: scope.tenantId } });
    const submittedReturns = await prisma.vatReturn.count({
      where: { tenantId: scope.tenantId, status: "submitted" },
    });
    const mtdSubmissions = await prisma.hmrcMtdSubmission.count({ where: { tenantId: scope.tenantId } });
    return {
      supported: true,
      kpis: {
        vatReturns,
        submittedReturns,
        mtdSubmissions,
      },
    };
  } catch {
    return { supported: false, message: "error computing tax KPIs", kpis: {} };
  }
}

export async function getPlanningKpis(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  try {
    // Import planning service (dynamic to avoid circular deps)
    const { getNetRequirementsPlan, getRecommendations } = await import("@/server/planning/service");

    // Get net requirements and recommendations (best-effort)
    const netResult = await getNetRequirementsPlan(scope.tenantId, { horizonMonths: 3 });
    const recResult = await getRecommendations(scope.tenantId, { horizonMonths: 3 });

    if (!netResult.supported || !recResult.supported) {
      return {
        supported: false,
        message: "planning calculations require demand/supply data",
        kpis: {},
      };
    }

    const constrainedItems = netResult.requirements.filter((r) => r.netRequirement > 0).length;
    const netShortageValue = netResult.requirements.reduce((sum, r) => sum + r.netRequirement, 0); // Simplified: count units
    const suggestedActionsCount = recResult.recommendations.length;

    return {
      supported: true,
      kpis: {
        planning_constrained_items: constrainedItems,
        planning_net_shortage_value: netShortageValue,
        planning_suggested_actions_count: suggestedActionsCount,
      },
    };
  } catch {
    return {
      supported: false,
      message: "planning calculations not available",
      kpis: {},
    };
  }
}

export async function getAllKpis(scope: Scope) {
  const [finance, banking, hr, inventory, manufacturing, purchasing, projects, sales, pos, tax, planning] = await Promise.all([
    getFinanceKpis(scope),
    getBankingKpis(scope),
    getHrKpis(scope),
    getInventoryKpis(scope),
    getManufacturingKpis(scope),
    getPurchasingKpis(scope),
    getProjectsKpis(scope),
    getSalesKpis(scope),
    getPosKpis(scope),
    getTaxKpis(scope),
    getPlanningKpis(scope),
  ]);
  return { finance, banking, hr, inventory, manufacturing, purchasing, projects, sales, pos, tax, planning };
}
