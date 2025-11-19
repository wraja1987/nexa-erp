/**
 * Centralized Tax Service
 * Phase 4D - Depth Pass: Centralized tax logic used everywhere
 */

import { prisma } from "@/lib/prisma";

export interface TaxCalculationInput {
  tenantId: string;
  subtotal: number;
  currency?: string;
  customerId?: string;
  sku?: string;
  jurisdiction?: string; // UK, EU, GCC, etc.
}

export interface TaxCalculationResult {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  taxCode?: string;
}

/**
 * Calculate tax for a transaction
 * Uses TaxGroup, TaxRule, TaxJurisdiction models
 */
export async function calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
  const { tenantId, subtotal, customerId, sku, jurisdiction = "UK" } = input;

  // Default UK standard VAT rate (20%)
  let taxRate = 0.20;
  let taxCode = "STANDARD";

  try {
    // Try to find applicable tax rule
    // First, check for customer-specific rule
    if (customerId) {
      const customerRule = await prisma.taxRule.findFirst({
        where: {
          taxGroup: {
            tenantId,
          },
          customerCode: customerId,
          jurisdiction,
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: new Date() } },
          ],
        },
        include: {
          taxGroup: true,
        },
        orderBy: {
          effectiveFrom: "desc",
        },
      });

      if (customerRule) {
        taxRate = Number(customerRule.rate);
        taxCode = customerRule.taxGroup.code;
        return {
          subtotal,
          taxRate,
          taxAmount: subtotal * taxRate,
          total: subtotal * (1 + taxRate),
          taxCode,
        };
      }
    }

    // Check for product-specific rule
    if (sku) {
      const productRule = await prisma.taxRule.findFirst({
        where: {
          taxGroup: {
            tenantId,
          },
          productCode: sku,
          jurisdiction,
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: new Date() } },
          ],
        },
        include: {
          taxGroup: true,
        },
        orderBy: {
          effectiveFrom: "desc",
        },
      });

      if (productRule) {
        taxRate = Number(productRule.rate);
        taxCode = productRule.taxGroup.code;
        return {
          subtotal,
          taxRate,
          taxAmount: subtotal * taxRate,
          total: subtotal * (1 + taxRate),
          taxCode,
        };
      }
    }

    // Check for jurisdiction default rule
    const jurisdictionRule = await prisma.taxRule.findFirst({
      where: {
        taxGroup: {
          tenantId,
        },
        jurisdiction,
        productCode: null,
        customerCode: null,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      include: {
        taxGroup: true,
      },
      orderBy: {
        effectiveFrom: "desc",
      },
    });

    if (jurisdictionRule) {
      taxRate = Number(jurisdictionRule.rate);
      taxCode = jurisdictionRule.taxGroup.code;
    }
  } catch (error) {
    // Log but fall back to default rate
    console.error("[Tax] Error calculating tax, using default rate:", error);
  }

  return {
    subtotal,
    taxRate,
    taxAmount: subtotal * taxRate,
    total: subtotal * (1 + taxRate),
    taxCode,
  };
}

/**
 * Calculate tax for multiple line items
 */
export async function calculateTaxForLines(
  tenantId: string,
  lines: Array<{ subtotal: number; customerId?: string; sku?: string }>,
  jurisdiction: string = "UK"
): Promise<{ lines: TaxCalculationResult[]; total: TaxCalculationResult }> {
  const lineResults: TaxCalculationResult[] = [];

  for (const line of lines) {
    const result = await calculateTax({
      tenantId,
      subtotal: line.subtotal,
      customerId: line.customerId,
      sku: line.sku,
      jurisdiction,
    });
    lineResults.push(result);
  }

  const totalSubtotal = lineResults.reduce((sum, r) => sum + r.subtotal, 0);
  const totalTax = lineResults.reduce((sum, r) => sum + r.taxAmount, 0);
  const totalTotal = lineResults.reduce((sum, r) => sum + r.total, 0);

  return {
    lines: lineResults,
    total: {
      subtotal: totalSubtotal,
      taxRate: totalSubtotal > 0 ? totalTax / totalSubtotal : 0,
      taxAmount: totalTax,
      total: totalTotal,
    },
  };
}

