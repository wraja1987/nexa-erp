export type DimensionType = "department" | "cost_center" | "project" | "region";

export type DimensionFilters = {
  type?: DimensionType;
  values?: string[];
};

export function parseDimensionFilters(params: URLSearchParams | Record<string, any>): DimensionFilters {
  const get = (k: string) => {
    if (params instanceof URLSearchParams) return params.get(k);
    return (params as any)?.[k];
  };
  const type = (get("dimensionType") || undefined) as DimensionType | undefined;
  const raw = get("dimensionValues") || get("dimensionValueId") || get("dimensionValueIds") || "";
  const values = typeof raw === "string" ? raw.split(",").map((s) => s.trim()).filter(Boolean) : Array.isArray(raw) ? raw : [];
  return { type, values };
}

/**
 * Validates that requested dimensions are supported in the current schema and (optionally) belong to tenant scope.
 * Since current schema has no finance dimension fields, we always return supported=false.
 */
export async function validateDimensionFiltersForTenant(
  tenantId: string,
  filters: DimensionFilters
): Promise<{ ok: boolean; supported: boolean; reason?: string }> {
  if (!filters.type || !filters.values || filters.values.length === 0) {
    return { ok: true, supported: false, reason: "no filters provided" };
  }
  // Schema gap: No dimension fields on finance rows today
  return { ok: true, supported: false, reason: "dimensions not linked to finance rows in current schema" };
}

/**
 * Build JournalLine where-clause with dimensions applied if supported.
 * Current schema lacks dimension columns -> returns base where unchanged.
 */
export function buildJournalLineWhereWithDimensions<T extends object>(
  baseWhere: T,
  _filters: DimensionFilters
): T {
  return baseWhere;
}

/**
 * Build CustomerInvoice where-clause with dimensions applied if supported.
 * Current schema lacks dimension columns -> returns base where unchanged.
 */
export function buildInvoiceWhereWithDimensions<T extends object>(
  baseWhere: T,
  _filters: DimensionFilters
): T {
  return baseWhere;
}


