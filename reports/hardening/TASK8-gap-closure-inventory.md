# Task 8 Gap Closure — Comprehensive Gap Inventory

**Generated**: 2025-01-18  
**Status**: Gap Discovery Complete

---

## Purpose

This document catalogs all schema gaps, 501 responses, and `supported:false` markers across all Task 8 phases (0-28) to enable systematic gap closure.

---

## Gap Categories

### 1. Data Model Gaps (Missing Prisma Models)

#### Phase 6 — Purchasing
- ❌ **BlanketPO** — Blanket purchase orders
- ❌ **SupplierContract** — Supplier contracts/pricing
- ❌ **LandedCost** — Landed cost allocation
- ❌ **SupplierPerformance** — OTIF + Quality KPIs

#### Phase 7 — Projects/PSA
- ❌ **Project** — Project master
- ❌ **ProjectPhase** — Project phases
- ❌ **ProjectTask** — Project tasks (if needed)
- ❌ **Timesheet** — Timesheet entries
- ❌ **TimesheetApproval** — Timesheet approvals
- ❌ **ProjectRetainer** — Retainers
- ❌ **ProjectInvoiceLine** — Link projects to invoices

#### Phase 8 — Sales + CRM
- ❌ **Customer** — Customer master (referenced but not present)
- ❌ **CrmAccount** — CRM accounts
- ❌ **CrmContact** — CRM contacts
- ❌ **CrmActivity** — CRM activities
- ❌ **CrmOpportunity** — CRM opportunities/pipelines
- ❌ **SalesQuote** — Sales quotes
- ❌ **SalesQuoteLine** — Quote line items
- ❌ **SalesOrder** — Sales orders
- ❌ **SalesOrderLine** — Order line items
- ❌ **Reservation** — Inventory reservations/backorders

#### Phase 9 — POS
- ❌ **PosSession** — POS sessions
- ❌ **PosDrawer** — Cash drawers
- ❌ **PosPromotion** — POS promotions
- ❌ **PosVariance** — Till variances

#### Phase 10 — Tax + Compliance
- ❌ **TaxCode** — Tax codes
- ❌ **TaxRate** — Tax rates
- ❌ **HmrcMtdSubmission** — HMRC MTD submission logs
- ❌ **GccEinvoicePayload** — GCC e-invoice payloads
- ⚠️ **VatReturn** — Exists but missing `tenantId` field

#### Phase 11 — Analytics
- ❌ **MetricPoint** — Metrics store
- ❌ **MetricsSnapshot** — KPI snapshots

#### Phase 13 — Admin + Config
- ❌ **Partner** — Partner master
- ❌ **PartnerTenant** — Partner-tenant mapping
- ❌ **TenantConfig** — Tenant configuration (localisation, flags)

#### Phase 14 — Healthcare
- ❌ **Practice** — Healthcare practices
- ❌ **Pcn** — Primary Care Networks
- ❌ **PracticePcn** — Practice-PCN join
- ❌ **HealthcareRotaHeader** — Rota headers
- ❌ **HealthcareRotaShift** — Rota shifts
- ❌ **HealthcareRotaAssignment** — Rota assignments
- ❌ **ArrsRole** — ARRS roles
- ❌ **ArrsAssignment** — ARRS assignments
- ❌ **LocumAssignment** — Locum assignments
- ❌ **HealthcareClaim** — Healthcare claims
- ❌ **ArrsClaim** — ARRS claims

#### Phase 16 — Attachments
- ❌ **Attachment** — Attachment records

#### Phase 17 — Import/Export
- ❌ **ImportJob** — Import job tracking
- ❌ **ImportJobItem** — Import job items (for undo)
- ❌ **PriceList** — Price lists
- ❌ **PriceListItem** — Price list items

#### Phase 18 — Event Bus
- ❌ **OutboxEvent** — Event outbox
- ❌ **EventSubscription** — Event subscriptions (optional)

#### Phase 19 — BYOK + Residency
- ❌ **TenantKey** — Tenant encryption keys
- ❌ **TenantConfig** — Tenant config (region, BYOK flags)
- ❌ **BackupPolicy** — Backup policies
- ❌ **BackupRun** — Backup run metadata

#### Phase 24 — Workflow
- ❌ **WorkflowDefinition** — Workflow definitions
- ❌ **WorkflowInstance** — Workflow instances
- ❌ **WorkflowHistory** — Workflow history

#### Phase 25 — Custom Fields
- ❌ **CustomFieldDefinition** — Custom field definitions
- ❌ **CustomFieldValue** — Custom field values (EAV)

#### Phase 26 — Planning
- ❌ **SafetyStock** — Safety stock configuration
- ❌ **PlanningSnapshot** — Planning snapshots (optional)
- ❌ **PlanRecommendation** — Persisted recommendations (optional)

#### Phase 27 — User Management
- ❌ **Department** — Departments
- ❌ **Team** — Teams
- ❌ **UserDepartment** — User-department join
- ❌ **UserTeam** — User-team join
- ⚠️ **Tenant** — Missing `status` field

#### Phase 28 — Agent Logs
- ❌ **AgentRun** — Agent run logs
- ❌ **AgentStep** — Agent step logs
- ❌ **AgentConfig** — Per-tenant agent config

---

## Current Behaviour vs Required Spec

### Phase 6 — Purchasing
| Feature | Current | Required |
|---------|---------|----------|
| Blanket POs | Returns 501 | Full CRUD + blanket release |
| Supplier contracts | Returns 501 | Contract management + pricing |
| Landed costs | Returns 501 | Cost allocation to inventory |
| Supplier performance | Returns 501 | OTIF + Quality KPIs |

### Phase 7 — Projects
| Feature | Current | Required |
|---------|---------|----------|
| Projects | Returns 501 | Full CRUD + phases |
| Timesheets | Returns 501 | Entry + approval + GL posting |
| Billing | Returns 501 | T&M, milestone, fixed, retainers |
| WIP | Returns supported:false | Real WIP calculation |
| Profitability | Returns supported:false | Real profitability views |

### Phase 8 — Sales + CRM
| Feature | Current | Required |
|---------|---------|----------|
| CRM Accounts | Returns 501 | Full CRUD |
| CRM Contacts | Returns 501 | Full CRUD |
| CRM Activities | Returns 501 | Full CRUD |
| CRM Opportunities | Returns 501 | Pipeline management |
| Sales Quotes | Returns 501 | Quote versioning + conversion |
| Sales Orders | Returns 501 | Order management + reservations |
| Customers | Returns 501 | Customer master CRUD |

### Phase 9 — POS
| Feature | Current | Required |
|---------|---------|----------|
| Sessions | Returns 501 | Open/close + cash-up |
| Promotions | Returns 501 | Promotion management |
| Variance | Returns 501 | Variance tracking |

### Phase 10 — Tax
| Feature | Current | Required |
|---------|---------|----------|
| VAT Returns | Missing tenantId | Tenant-scoped VAT returns |
| HMRC MTD | Returns 501 | Full MTD integration |
| GCC e-invoice | Returns supported:false | Full GCC payload generation |
| Tax codes/rates | Missing models | Tax code management |

### Phase 11 — Analytics
| Feature | Current | Required |
|---------|---------|----------|
| Metrics store | In-memory | DB-backed metrics |
| KPI snapshots | Virtual | Persisted snapshots |

### Phase 13 — Admin
| Feature | Current | Required |
|---------|---------|----------|
| Partners | Returns 501 | Partner management |
| Tenant config | Returns 501 | Localisation + flags |

### Phase 14 — Healthcare
| Feature | Current | Required |
|---------|---------|----------|
| Practices | Returns 501 | Practice CRUD |
| PCNs | Returns 501 | PCN management |
| Rota | Returns 501 | Rota management |
| Claims | Returns 501 | Claim processing |

### Phase 16 — Attachments
| Feature | Current | Required |
|---------|---------|----------|
| Attachments | Returns 501 | Full attachment CRUD + S3 |

### Phase 17 — Import/Export
| Feature | Current | Required |
|---------|---------|----------|
| Customer import | Returns 501 | Full import + undo |
| Price list import | Returns 501 | Full import + undo |
| Sales order import | Returns 501 | Full import + undo |
| Import jobs | Returns 501 | Job tracking + undo |

### Phase 18 — Events
| Feature | Current | Required |
|---------|---------|----------|
| Outbox | Returns supported:false | Durable outbox |
| Event replay | Returns 501 | Replay from outbox |
| Event list | Returns 501 | List from outbox |

### Phase 19 — BYOK
| Feature | Current | Required |
|---------|---------|----------|
| Tenant keys | Returns supported:false | Key storage + rotation |
| Encryption | Returns supported:false | Real encryption |
| Residency | Returns UNKNOWN | Region-based residency |

### Phase 24 — Workflow
| Feature | Current | Required |
|---------|---------|----------|
| Definitions | In-memory | Persisted definitions |
| Instances | In-memory | Persisted instances |
| History | Returns 501 | Persisted history |

### Phase 25 — Custom Fields
| Feature | Current | Required |
|---------|---------|----------|
| Definitions | Returns 501 | Persisted definitions |
| Values | Returns 501 | EAV storage |

### Phase 26 — Planning
| Feature | Current | Required |
|---------|---------|----------|
| Safety stock | Naive default | Persisted safety stock |
| Recommendations | Transient | Optional persistence |

### Phase 27 — User Management
| Feature | Current | Required |
|---------|---------|----------|
| Tenant status | Returns unknown | Tenant.status field |
| Departments | Missing | Department model |
| Teams | Missing | Team model |

### Phase 28 — Agent Logs
| Feature | Current | Required |
|---------|---------|----------|
| Runs | Returns supported:false | Persisted runs |
| Steps | Returns supported:false | Persisted steps |

---

## Summary Statistics

- **Total Missing Models**: ~60+
- **Total 501 Responses**: ~50+
- **Total supported:false Markers**: ~30+
- **Phases Affected**: 6, 7, 8, 9, 10, 11, 13, 14, 16, 17, 18, 19, 24, 25, 26, 27, 28

---

## Next Steps

1. **Schema Design**: Design all missing models with proper relationships
2. **Migration Generation**: Create Prisma migrations for all models
3. **Stub Replacement**: Replace all 501/supported:false with real implementations
4. **UI Completion**: Remove schema gap notices, complete all pages
5. **Verification**: Run all checks, ensure zero gaps remain

