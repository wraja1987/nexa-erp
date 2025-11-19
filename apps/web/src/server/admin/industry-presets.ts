/**
 * Phase 13 — Industry Presets
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type IndustryPresetId = "MANUFACTURING" | "RETAIL" | "GP_HEALTHCARE" | "ACCOUNTING_PROFESSIONAL_SERVICES";

export type IndustryPreset = {
  id: IndustryPresetId;
  name: string;
  description: string;
  suggestedModules: {
    usesManufacturing: boolean;
    usesPOS: boolean;
    usesHealthcare: boolean;
    usesProjects: boolean;
    usesInventory: boolean;
    usesPayroll: boolean;
  };
  suggestedKpis: string[];
  suggestedCoATemplateId: string;
  recommendedSettings: {
    dashboards?: string[];
    reports?: string[];
  };
};

// In-code catalogue of industry presets
const INDUSTRY_PRESETS: Record<IndustryPresetId, IndustryPreset> = {
  MANUFACTURING: {
    id: "MANUFACTURING",
    name: "Manufacturing",
    description: "Preset for manufacturing businesses with BOM, work orders, and inventory management",
    suggestedModules: {
      usesManufacturing: true,
      usesPOS: false,
      usesHealthcare: false,
      usesProjects: false,
      usesInventory: true,
      usesPayroll: true,
    },
    suggestedKpis: [
      "Inventory Turnover",
      "Work Order Completion Rate",
      "Material Cost Variance",
      "Labour Efficiency",
      "On-Time Delivery",
    ],
    suggestedCoATemplateId: "MANUFACTURING_BASE",
    recommendedSettings: {
      dashboards: ["Manufacturing Dashboard", "Inventory Dashboard", "Cost Analysis"],
      reports: ["Work Order Status", "BOM Cost Rollup", "Material Usage", "Labour Cost Analysis"],
    },
  },
  RETAIL: {
    id: "RETAIL",
    name: "Retail",
    description: "Preset for retail businesses with POS, inventory, and sales management",
    suggestedModules: {
      usesManufacturing: false,
      usesPOS: true,
      usesHealthcare: false,
      usesProjects: false,
      usesInventory: true,
      usesPayroll: true,
    },
    suggestedKpis: [
      "Sales per Square Foot",
      "Inventory Turnover",
      "Average Transaction Value",
      "Customer Retention Rate",
      "Gross Margin %",
    ],
    suggestedCoATemplateId: "RETAIL_BASE",
    recommendedSettings: {
      dashboards: ["Sales Dashboard", "POS Dashboard", "Inventory Dashboard"],
      reports: ["Sales by Product", "Sales by Store", "Inventory Valuation", "Cash Reconciliation"],
    },
  },
  GP_HEALTHCARE: {
    id: "GP_HEALTHCARE",
    name: "GP Practice / Healthcare",
    description: "Preset for GP practices and healthcare providers with patient management and NHS contracts",
    suggestedModules: {
      usesManufacturing: false,
      usesPOS: false,
      usesHealthcare: true,
      usesProjects: false,
      usesInventory: false,
      usesPayroll: true,
    },
    suggestedKpis: [
      "Patient Appointments per Day",
      "NHS Contract Revenue",
      "Private Patient Revenue",
      "Staff Utilisation",
      "Claims Processing Time",
    ],
    suggestedCoATemplateId: "GP_PRACTICE",
    recommendedSettings: {
      dashboards: ["Healthcare Dashboard", "Appointments Dashboard", "Revenue Dashboard"],
      reports: ["Patient Revenue", "NHS Claims", "Staff Rota", "Payroll Summary"],
    },
  },
  ACCOUNTING_PROFESSIONAL_SERVICES: {
    id: "ACCOUNTING_PROFESSIONAL_SERVICES",
    name: "Accounting / Professional Services",
    description: "Preset for accounting firms and professional services with time tracking and project billing",
    suggestedModules: {
      usesManufacturing: false,
      usesPOS: false,
      usesHealthcare: false,
      usesProjects: true,
      usesInventory: false,
      usesPayroll: true,
    },
    suggestedKpis: [
      "Billable Hours",
      "Utilisation Rate",
      "Revenue per Employee",
      "Project Profitability",
      "Client Retention Rate",
    ],
    suggestedCoATemplateId: "UK_SMALL_SERVICE",
    recommendedSettings: {
      dashboards: ["Projects Dashboard", "Time Tracking Dashboard", "Revenue Dashboard"],
      reports: ["Project WIP", "Time & Materials Billing", "Client Profitability", "Staff Utilisation"],
    },
  },
};

export type IndustryPresetApplicationResult = {
  supported: boolean;
  applied: boolean;
  presetId: IndustryPresetId;
  recommendations: {
    coaTemplateId: string;
    modules: Record<string, boolean>;
    kpis: string[];
    dashboards?: string[];
    reports?: string[];
  };
  message?: string;
};

/**
 * List available industry presets (metadata only).
 */
export async function listIndustryPresets(): Promise<Array<{ id: IndustryPresetId; name: string; description: string }>> {
  return Object.values(INDUSTRY_PRESETS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));
}

/**
 * Get full industry preset definition.
 */
export async function getIndustryPresetDetail(presetId: IndustryPresetId): Promise<IndustryPreset | null> {
  return INDUSTRY_PRESETS[presetId] || null;
}

/**
 * Apply industry preset.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function applyIndustryPreset(
  tenantId: string,
  presetId: IndustryPresetId,
  actorId: string
): Promise<IndustryPresetApplicationResult> {
  const preset = INDUSTRY_PRESETS[presetId];
  if (!preset) {
    return {
      supported: false,
      applied: false,
      presetId,
      recommendations: {
        coaTemplateId: "",
        modules: {},
        kpis: [],
      },
      message: `Preset ${presetId} not found`,
    };
  }

  // Get or create TenantConfig
  const config = await prisma.tenantConfig.upsert({
    where: { tenantId },
    update: {
      config: {
        ...(preset.suggestedModules.usesManufacturing && { manufacturing: { enabled: true } }),
        ...(preset.suggestedModules.usesPOS && { pos: { enabled: true } }),
        ...(preset.suggestedModules.usesHealthcare && { healthcare: { enabled: true } }),
        ...(preset.suggestedModules.usesProjects && { projects: { enabled: true } }),
        ...(preset.suggestedModules.usesInventory && { inventory: { enabled: true } }),
        ...(preset.suggestedModules.usesPayroll && { payroll: { enabled: true } }),
        industryPreset: presetId,
        appliedAt: new Date().toISOString(),
      } as any,
    },
    create: {
      tenantId,
      config: {
        ...(preset.suggestedModules.usesManufacturing && { manufacturing: { enabled: true } }),
        ...(preset.suggestedModules.usesPOS && { pos: { enabled: true } }),
        ...(preset.suggestedModules.usesHealthcare && { healthcare: { enabled: true } }),
        ...(preset.suggestedModules.usesProjects && { projects: { enabled: true } }),
        ...(preset.suggestedModules.usesInventory && { inventory: { enabled: true } }),
        ...(preset.suggestedModules.usesPayroll && { payroll: { enabled: true } }),
        industryPreset: presetId,
        appliedAt: new Date().toISOString(),
      } as any,
    },
  });

  // Audit log
  try {
    await auditEvent("admin.industry_preset.applied", {
      tenantId,
      presetId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return {
    supported: true,
    applied: true,
    presetId,
    recommendations: {
      coaTemplateId: preset.suggestedCoATemplateId,
      modules: preset.suggestedModules,
      kpis: preset.suggestedKpis,
      dashboards: preset.recommendedSettings.dashboards,
      reports: preset.recommendedSettings.reports,
    },
  };
}
