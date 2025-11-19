import { prisma } from "@/lib/prisma";

export type CoATemplateId = "UK_SMALL_SERVICE" | "MANUFACTURING_BASE" | "RETAIL_BASE" | "GP_PRACTICE";

export type CoAAccountDefinition = {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  group?: string;
};

export type CoATemplate = {
  id: CoATemplateId;
  name: string;
  description: string;
  accounts: CoAAccountDefinition[];
};

// In-code catalogue of CoA templates
const COA_TEMPLATES: Record<CoATemplateId, CoATemplate> = {
  UK_SMALL_SERVICE: {
    id: "UK_SMALL_SERVICE",
    name: "UK Small Service Business",
    description: "Basic chart of accounts for UK small service businesses (consulting, professional services)",
    accounts: [
      { code: "1000", name: "Cash at Bank", type: "asset", group: "Current Assets" },
      { code: "1100", name: "Accounts Receivable", type: "asset", group: "Current Assets" },
      { code: "1200", name: "Prepaid Expenses", type: "asset", group: "Current Assets" },
      { code: "2000", name: "Accounts Payable", type: "liability", group: "Current Liabilities" },
      { code: "2100", name: "Accrued Expenses", type: "liability", group: "Current Liabilities" },
      { code: "3000", name: "Share Capital", type: "equity", group: "Equity" },
      { code: "3100", name: "Retained Earnings", type: "equity", group: "Equity" },
      { code: "4000", name: "Service Revenue", type: "revenue", group: "Revenue" },
      { code: "5000", name: "Salaries & Wages", type: "expense", group: "Operating Expenses" },
      { code: "5100", name: "Rent", type: "expense", group: "Operating Expenses" },
      { code: "5200", name: "Utilities", type: "expense", group: "Operating Expenses" },
      { code: "5300", name: "Professional Fees", type: "expense", group: "Operating Expenses" },
    ],
  },
  MANUFACTURING_BASE: {
    id: "MANUFACTURING_BASE",
    name: "Manufacturing Base",
    description: "Chart of accounts for manufacturing businesses with inventory and cost of goods sold",
    accounts: [
      { code: "1000", name: "Cash at Bank", type: "asset", group: "Current Assets" },
      { code: "1100", name: "Accounts Receivable", type: "asset", group: "Current Assets" },
      { code: "1200", name: "Raw Materials Inventory", type: "asset", group: "Current Assets" },
      { code: "1300", name: "Work in Progress", type: "asset", group: "Current Assets" },
      { code: "1400", name: "Finished Goods Inventory", type: "asset", group: "Current Assets" },
      { code: "2000", name: "Accounts Payable", type: "liability", group: "Current Liabilities" },
      { code: "3000", name: "Share Capital", type: "equity", group: "Equity" },
      { code: "4000", name: "Sales Revenue", type: "revenue", group: "Revenue" },
      { code: "5000", name: "Cost of Goods Sold", type: "expense", group: "Cost of Sales" },
      { code: "5100", name: "Direct Labour", type: "expense", group: "Cost of Sales" },
      { code: "5200", name: "Manufacturing Overhead", type: "expense", group: "Cost of Sales" },
      { code: "6000", name: "Salaries & Wages", type: "expense", group: "Operating Expenses" },
      { code: "6100", name: "Rent", type: "expense", group: "Operating Expenses" },
      { code: "6200", name: "Utilities", type: "expense", group: "Operating Expenses" },
    ],
  },
  RETAIL_BASE: {
    id: "RETAIL_BASE",
    name: "Retail Base",
    description: "Chart of accounts for retail businesses with inventory and sales",
    accounts: [
      { code: "1000", name: "Cash at Bank", type: "asset", group: "Current Assets" },
      { code: "1100", name: "Cash on Hand", type: "asset", group: "Current Assets" },
      { code: "1200", name: "Accounts Receivable", type: "asset", group: "Current Assets" },
      { code: "1300", name: "Inventory", type: "asset", group: "Current Assets" },
      { code: "2000", name: "Accounts Payable", type: "liability", group: "Current Liabilities" },
      { code: "3000", name: "Share Capital", type: "equity", group: "Equity" },
      { code: "4000", name: "Sales Revenue", type: "revenue", group: "Revenue" },
      { code: "4100", name: "Sales Returns", type: "revenue", group: "Revenue" },
      { code: "5000", name: "Cost of Goods Sold", type: "expense", group: "Cost of Sales" },
      { code: "6000", name: "Salaries & Wages", type: "expense", group: "Operating Expenses" },
      { code: "6100", name: "Rent", type: "expense", group: "Operating Expenses" },
      { code: "6200", name: "Utilities", type: "expense", group: "Operating Expenses" },
      { code: "6300", name: "Marketing & Advertising", type: "expense", group: "Operating Expenses" },
    ],
  },
  GP_PRACTICE: {
    id: "GP_PRACTICE",
    name: "GP Practice / Healthcare",
    description: "Chart of accounts for GP practices and healthcare providers",
    accounts: [
      { code: "1000", name: "Cash at Bank", type: "asset", group: "Current Assets" },
      { code: "1100", name: "Accounts Receivable", type: "asset", group: "Current Assets" },
      { code: "1200", name: "Prepaid Expenses", type: "asset", group: "Current Assets" },
      { code: "2000", name: "Accounts Payable", type: "liability", group: "Current Liabilities" },
      { code: "2100", name: "Accrued Expenses", type: "liability", group: "Current Liabilities" },
      { code: "3000", name: "Share Capital", type: "equity", group: "Equity" },
      { code: "4000", name: "NHS Contract Revenue", type: "revenue", group: "Revenue" },
      { code: "4100", name: "Private Patient Revenue", type: "revenue", group: "Revenue" },
      { code: "5000", name: "Staff Salaries", type: "expense", group: "Operating Expenses" },
      { code: "5100", name: "Locum Costs", type: "expense", group: "Operating Expenses" },
      { code: "5200", name: "Premises Costs", type: "expense", group: "Operating Expenses" },
      { code: "5300", name: "Medical Supplies", type: "expense", group: "Operating Expenses" },
      { code: "5400", name: "IT & Systems", type: "expense", group: "Operating Expenses" },
    ],
  },
};

export type CoAPreviewResult = {
  supported: boolean;
  templateId: CoATemplateId;
  existingAccounts: Array<{ code: string; name: string; type: string }>;
  newAccounts: Array<{ code: string; name: string; type: string }>;
  message?: string;
};

export type CoAApplyResult = {
  supported: boolean;
  applied: boolean;
  accountsCreated: number;
  accountsSkipped: number;
  message?: string;
};

/**
 * List available CoA templates (metadata only).
 */
export async function listCoaTemplates(tenantId: string): Promise<Array<{ id: CoATemplateId; name: string; description: string }>> {
  return Object.values(COA_TEMPLATES).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }));
}

/**
 * Get full CoA template definition.
 */
export async function getCoaTemplateDetail(tenantId: string, templateId: CoATemplateId): Promise<CoATemplate | null> {
  return COA_TEMPLATES[templateId] || null;
}

/**
 * Preview what accounts would be added vs existing accounts.
 */
export async function previewCoaApplication(tenantId: string, templateId: CoATemplateId): Promise<CoAPreviewResult> {
  const template = COA_TEMPLATES[templateId];
  if (!template) {
    return {
      supported: false,
      templateId,
      existingAccounts: [],
      newAccounts: [],
      message: `Template ${templateId} not found`,
    };
  }

  // Load existing accounts for this tenant
  const existingAccounts = await prisma.account.findMany({
    where: { tenantId },
    select: { code: true, name: true, type: true },
  });

  const existingCodes = new Set(existingAccounts.map((a) => a.code || ""));

  const newAccounts = template.accounts.filter((acc) => !existingCodes.has(acc.code));
  const existingMatches = template.accounts.filter((acc) => existingCodes.has(acc.code));

  return {
    supported: true,
    templateId,
    existingAccounts: existingMatches.map((acc) => ({
      code: acc.code,
      name: acc.name,
      type: acc.type,
    })),
    newAccounts: newAccounts.map((acc) => ({
      code: acc.code,
      name: acc.name,
      type: acc.type,
    })),
  };
}

/**
 * Apply CoA template (safe insert of new Account rows).
 * Only inserts accounts that don't already exist (by tenantId + code unique constraint).
 */
export async function applyCoaTemplate(tenantId: string, templateId: CoATemplateId, actorId: string): Promise<CoAApplyResult> {
  const template = COA_TEMPLATES[templateId];
  if (!template) {
    return {
      supported: false,
      applied: false,
      accountsCreated: 0,
      accountsSkipped: 0,
      message: `Template ${templateId} not found`,
    };
  }

  // Check if Account model supports safe inserts
  // The schema has @@unique([tenantId, code]), so we can safely upsert
  let accountsCreated = 0;
  let accountsSkipped = 0;

  try {
    await prisma.$transaction(async (tx) => {
      for (const acc of template.accounts) {
        try {
          await tx.account.upsert({
            where: {
              tenantId_code: {
                tenantId,
                code: acc.code,
              } as any,
            },
            update: {
              // Don't update existing accounts
            },
            create: {
              tenantId,
              code: acc.code,
              name: acc.name,
              type: acc.type,
            },
          });
          accountsCreated++;
        } catch (e: any) {
          // If account already exists, skip it
          if (e.code === "P2002" || e.message?.includes("Unique constraint")) {
            accountsSkipped++;
          } else {
            throw e;
          }
        }
      }
    });

    return {
      supported: true,
      applied: true,
      accountsCreated,
      accountsSkipped,
    };
  } catch (e: any) {
    return {
      supported: false,
      applied: false,
      accountsCreated: 0,
      accountsSkipped: 0,
      message: `Failed to apply CoA template. Error: ${e?.message || "unknown"}`,
    };
  }
}

