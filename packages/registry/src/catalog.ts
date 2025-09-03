export type ModuleStatus = "Active" | "Coming Soon" | "Beta";
export type ModuleCategory =
  | "Finance"
  | "Operations"
  | "Sales"
  | "Inventory"
  | "Manufacturing"
  | "HR"
  | "Analytics"
  | "Compliance";

export type Module = {
  slug: string;
  name: string;
  category: ModuleCategory;
  status: ModuleStatus;
  blurb: string;
  icon?: string;
};

export const MODULES: Module[] = [
  {
    slug: "finance-ledger",
    name: "General Ledger",
    category: "Finance",
    status: "Active",
    blurb: "Multi-entity ledger with journals, period close, and audit trail.",
    icon: "Banknote",
  },
  {
    slug: "ap",
    name: "Accounts Payable",
    category: "Finance",
    status: "Active",
    blurb: "Smart invoice capture, approvals, and HMRC-ready VAT.",
    icon: "Receipt",
  },
  {
    slug: "inventory",
    name: "Inventory",
    category: "Inventory",
    status: "Active",
    blurb: "Batches, serials, and locations with fast stock lookups.",
    icon: "Boxes",
  },
  {
    slug: "mrp",
    name: "MRP",
    category: "Manufacturing",
    status: "Coming Soon",
    blurb: "Plan materials and capacity with AI-assisted scheduling.",
    icon: "Factory",
  },
  {
    slug: "hr",
    name: "HR",
    category: "HR",
    status: "Beta",
    blurb: "Employee profiles, leave, and basic payroll exports.",
    icon: "UserRound",
  },
];
