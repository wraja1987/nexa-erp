# Phase 25 — Custom Fields Engine

**Last updated**: 2025-01-18  
**Status**: ✅ Complete

---

## Purpose

Phase 25 implements a schema-safe, additive custom fields engine that allows tenants to define and use custom fields on various entity types (Invoices, Suppliers, Items, Employees, etc.) without modifying the Prisma schema.

---

## Who Should Read This

- Developers implementing custom field features
- QA engineers testing custom field functionality
- Product managers reviewing custom field capabilities
- Future schema migration planners

---

## Schema Discovery

### Existing JSON/Metadata Fields

**Found in Schema**:
- `EntityExt.meta Json?` — Could potentially store custom fields for entities (limited use)
- `UsageEvent.metadata Json` — Not suitable (usage events, not core entities)
- `AuditLog.data Json` — Not suitable (audit data, not entity metadata)
- `ThirdPartyConnector.config Json` — Not suitable (connector config)
- `Channel.config Json` — Not suitable (channel config)
- `IndustryWidget.config Json` — Not suitable (widget config)

**Missing**:
- ❌ No `CustomFieldDefinition` model
- ❌ No `CustomFieldValue` model
- ❌ No generic `metadata` or `customFields` JSON columns on core entities:
  - `CustomerInvoice` — No metadata field
  - `Supplier` — No metadata field
  - `InventoryItem` — No metadata field
  - `Employee` — No metadata field
  - `WorkOrder` — No metadata field
  - `PurchaseOrder` — No metadata field

### Target Entity Types

| Entity Type | Model | Metadata Field? | Value Storage Strategy |
|-------------|-------|-----------------|------------------------|
| `finance.invoice` | `CustomerInvoice` | ❌ | Schema gap stub |
| `purchasing.supplier` | `Supplier` | ❌ | Schema gap stub |
| `purchasing.po` | `PurchaseOrder` | ❌ | Schema gap stub |
| `inventory.item` | `InventoryItem` | ❌ | Schema gap stub |
| `hr.employee` | `Employee` | ❌ | Schema gap stub |
| `manufacturing.workorder` | `WorkOrder` | ❌ | Schema gap stub |
| `finance.entity` | `EntityExt` | ✅ (`meta Json?`) | Use `meta.customFields` if EntityExt exists |

---

## Feature Matrix

### Definitions CRUD

| Entity Type | Create | Read | Update | Delete | Storage |
|-------------|--------|------|--------|--------|---------|
| All | ❌ | ✅ | ❌ | ❌ | Code registry only |
| **Future** | ✅ | ✅ | ✅ | ✅ | CustomFieldDefinition table |

**Current Implementation**:
- Definitions are hard-coded in registry (`apps/web/src/server/customFields/registry.ts`)
- `createOrUpdateDefinition()` returns `supported:false` with schema gap message
- `deleteDefinition()` returns `supported:false` with schema gap message

### Values CRUD

| Entity Type | Create | Read | Update | Delete | Storage |
|-------------|--------|------|--------|--------|---------|
| `finance.entity` | ⚠️ | ⚠️ | ⚠️ | ⚠️ | `EntityExt.meta.customFields` (if EntityExt exists) |
| All others | ❌ | ❌ | ❌ | ❌ | Schema gap stub |

**Current Implementation**:
- For `finance.entity`: Uses `EntityExt.meta` JSON field if EntityExt record exists
- For all others: `getValuesForEntity()` and `upsertValuesForEntity()` return `supported:false` with schema gap message

### Search/Filter/Export

| Feature | Supported | Notes |
|---------|-----------|-------|
| Filter by custom fields | ❌ | Schema gap: no indexed storage |
| Search custom field values | ❌ | Schema gap: no full-text search on JSON |
| Export custom fields | ⚠️ | Partial: can include in CSV if values are available (read-only) |

### Audit Logging

| Feature | Supported | Notes |
|---------|-----------|-------|
| Log definition changes | ⚠️ | Best-effort via AuditLog (if definition persistence existed) |
| Log value changes | ⚠️ | Best-effort via AuditLog (if value persistence existed) |

---

## Architecture

### Core Components

1. **Types** (`apps/web/src/server/customFields/types.ts`)
   - `CustomFieldType` union
   - `CustomFieldDefinition` interface
   - `CustomFieldValue` interface
   - `CustomFieldLayout` interface

2. **Engine** (`apps/web/src/server/customFields/engine.ts`)
   - Pure functions: `validateValue()`, `normalizeValue()`, `applyDefaults()`, `filterableFields()`

3. **Registry** (`apps/web/src/server/customFields/registry.ts`)
   - Hard-coded default definitions per entity type
   - `getDefaultDefinitions()`, `listSupportedEntityTypes()`

4. **Definitions Service** (`apps/web/src/server/customFields/definitionsService.ts`)
   - `listDefinitions()` — Returns registry definitions
   - `createOrUpdateDefinition()` — Returns `supported:false` (schema gap)
   - `deleteDefinition()` — Returns `supported:false` (schema gap)

5. **Values Service** (`apps/web/src/server/customFields/valuesService.ts`)
   - `getValuesForEntity()` — Returns values or `supported:false`
   - `upsertValuesForEntity()` — Persists to `EntityExt.meta` if available, else returns `supported:false`

### API Layer

1. **Definitions**:
   - `/api/custom-fields/definitions/list` — GET: List definitions for entity type
   - `/api/custom-fields/definitions/save` — POST: Save definition (returns 501 if schema gap)

2. **Values**:
   - `/api/custom-fields/values/get` — GET: Get values for entity
   - `/api/custom-fields/values/save` — POST: Save values (returns 501 if schema gap)

### UI Layer

1. **Components**:
   - `CustomFieldsPanel` — Reusable panel for viewing/editing custom fields

2. **Admin Page**:
   - `/admin/custom-fields` — Manage definitions (read-only, shows schema gap message)

3. **Integration**:
   - Custom fields panels added to:
     - `/finance/invoices` detail/edit pages
     - `/purchasing/suppliers` detail page
     - `/inventory/items` detail page
     - `/hr/employees` detail page

---

## Schema Gaps and Workarounds

### Missing Tables

1. **CustomFieldDefinition**
   - **Gap**: No table to store custom field definitions per tenant
   - **Workaround**: Hard-coded definitions in registry
   - **Future**: Add CustomFieldDefinition table with tenantId, entityType, name, type, options, etc.

2. **CustomFieldValue**
   - **Gap**: No table to store custom field values per entity
   - **Workaround**: 
     - For `finance.entity`: Use `EntityExt.meta.customFields` JSON (if EntityExt exists)
     - For all others: Return `supported:false` with schema gap message
   - **Future**: Add CustomFieldValue table with tenantId, definitionId, entityType, entityId, value

### Schema-Safe Stubs

All persistence operations return `supported:false` with clear "schema gap" messaging when tables/columns don't exist. Definition registry works without persistence.

---

## Deliberate Limitations

To avoid breaking existing flows:

1. **Read-Only Definitions**: Definitions are code-based only (no persistence)
2. **Limited Value Storage**: Only `finance.entity` can store values (via EntityExt.meta)
3. **No Filtering**: Custom fields cannot be used in filters/search until schema migration
4. **Additive Only**: Custom fields are UI-only additions, no changes to core entity logic

---

## Future Enhancements

1. **Schema Migrations**: Add CustomFieldDefinition and CustomFieldValue tables
2. **Full Persistence**: Support value storage for all entity types
3. **Filtering**: Enable filtering/search by custom field values
4. **Export**: Include custom fields in CSV exports
5. **Validation Rules**: Add more complex validation (regex, ranges, etc.)
6. **Field Dependencies**: Support conditional field visibility based on other fields

---

**Last Updated**: 2025-01-18

