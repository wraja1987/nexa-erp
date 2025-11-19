/**
 * Phase 26 — Planning / S&OP Types
 *
 * Core types for planning engine (pure computation, no DB access).
 */

export interface PlanningBucket {
  start: string; // ISO date string (YYYY-MM-DD)
  end: string; // ISO date string (YYYY-MM-DD)
  label?: string; // Human-readable label (e.g., "Week 1", "Jan 2025")
}

export type DemandSource = "work_order" | "customer_invoice" | "forecast" | "manual";

export interface DemandSignal {
  itemId: string; // SKU / itemCode
  warehouseId?: string; // Optional warehouse scope
  locationId?: string; // Optional location scope
  bucket: PlanningBucket;
  quantityMinor: number; // Quantity in minor units (e.g., cents, units)
  source: DemandSource;
  metadata?: Record<string, any>; // Additional context (e.g., customerId, orderId)
}

export interface SupplySignal {
  itemId: string; // SKU / itemCode
  warehouseId?: string; // Optional warehouse scope
  locationId?: string; // Optional location scope
  bucket: PlanningBucket;
  onHand: number; // On-hand quantity
  openPO: number; // Open Purchase Order quantity
  openWO: number; // Open Work Order quantity (finished goods)
  transfersIn: number; // Incoming transfers
  transfersOut: number; // Outgoing transfers
  safetyStock?: number; // Safety stock level (if available)
  metadata?: Record<string, any>; // Additional context (e.g., PO number, WO number)
}

export interface DemandPlan {
  itemId: string;
  warehouseId?: string;
  locationId?: string;
  bucket: PlanningBucket;
  totalDemand: number; // Aggregated demand across all sources
  signals: DemandSignal[]; // Individual demand signals
}

export interface SupplyPlan {
  itemId: string;
  warehouseId?: string;
  locationId?: string;
  bucket: PlanningBucket;
  totalSupply: number; // Aggregated supply (on-hand + open PO + open WO + transfers)
  onHand: number;
  openPO: number;
  openWO: number;
  transfers: number; // Net transfers (in - out)
  safetyStock?: number;
}

export interface NetRequirement {
  itemId: string;
  warehouseId?: string;
  locationId?: string;
  bucket: PlanningBucket;
  demand: number;
  supply: number;
  netRequirement: number; // demand - supply (positive = shortage, negative = surplus)
  safetyStock?: number;
  projectedOnHand?: number; // Projected on-hand after this bucket
}

export type PlanRecommendationType = "purchase_order" | "work_order" | "transfer";

export type RecommendationConfidence = "low" | "medium" | "high";

export interface PlanRecommendation {
  id: string; // Generated ID (not persisted)
  tenantId: string;
  type: PlanRecommendationType;
  itemId: string;
  fromWarehouseId?: string; // For transfers
  toWarehouseId?: string; // For transfers and POs
  warehouseId?: string; // For WOs (production location)
  quantityMinor: number;
  dueDate: string; // ISO date string
  reason: string; // Human-readable reason
  confidence: RecommendationConfidence;
  bucket: PlanningBucket;
  metadata?: Record<string, any>; // Additional context (e.g., supplierId, leadTime)
}

export interface CapacityView {
  resourceCode: string; // Work centre / resource identifier
  bucket: PlanningBucket;
  availableMins: number; // Available capacity in minutes
  allocatedMins: number; // Allocated capacity (from WOs)
  utilizationPercent: number; // (allocated / available) * 100
  workOrders: Array<{
    workOrderId: string;
    itemCode: string;
    quantity: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
  }>;
}

export interface PlanningParams {
  horizonMonths?: number; // Planning horizon in months (default: 3)
  bucketSize?: "week" | "month"; // Time bucket size (default: "month")
  itemId?: string; // Filter by item
  warehouseId?: string; // Filter by warehouse
  locationId?: string; // Filter by location
  startDate?: string; // ISO date string (default: today)
}

