# Phase 22 — UI Migration Guide

**Last updated**: 2025-11-16

## Purpose

Guide for migrating existing pages to the unified Phase 22 design system.

## Migration Pattern

### Before (Old Pattern)
```tsx
import Page from "@/components/layout/Page";

export default function MyPage() {
  return (
    <Page title="My Page">
      <div className="rounded-2xl border bg-white p-6">
        <table className="w-full">
          {/* Basic table */}
        </table>
      </div>
    </Page>
  );
}
```

### After (New Pattern)
```tsx
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export default async function MyPage() {
  const data = await getData();
  
  const columns: Column<DataType>[] = [
    { key: "field", header: "Field", sortable: true },
    // ...
  ];

  return (
    <>
      <PageHeader
        title="My Page"
        breadcrumb={[
          { label: "Module", href: "/module" },
          { label: "My Page" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">Import</Button>
            <Button variant="primary" size="sm">New</Button>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Note">
          Schema limitation message here (if applicable).
        </Alert>

        <DataTable
          columns={columns}
          data={data}
          searchable={true}
          searchPlaceholder="Search..."
          emptyMessage="No data found"
        />
      </main>
    </>
  );
}
```

## Key Changes

1. **Remove `Page` wrapper** — AppShell is now in `app/(app)/layout.tsx`
2. **Use `PageHeader`** — Replaces title prop, adds breadcrumb and actions
3. **Use `DataTable`** — Replaces basic `<table>` elements
4. **Use `Card`** — Replaces custom rounded divs
5. **Use `Button`** — Replaces basic buttons
6. **Use `Alert`** — For schema gap messages (no "TODO" or "Coming soon")

## Component Replacements

| Old | New |
|-----|-----|
| `<Page title="...">` | `<PageHeader title="..." />` + `<main>` |
| `<table>` | `<DataTable columns={...} data={...} />` |
| `<div className="rounded-2xl border bg-white p-6">` | `<Card><CardContent>...</CardContent></Card>` |
| `<button className="...">` | `<Button variant="primary">...</Button>` |
| `"TODO"` or `"Coming soon"` | `<Alert variant="info">...</Alert>` |

## Checklist

- [ ] Remove `Page` wrapper
- [ ] Add `PageHeader` with title, breadcrumb, actions
- [ ] Replace `<table>` with `DataTable`
- [ ] Replace custom cards with `Card` component
- [ ] Replace buttons with `Button` component
- [ ] Replace placeholder text with `Alert` component
- [ ] Add `hideOnMobile` to non-essential columns
- [ ] Ensure responsive layout (grid with `md:` breakpoints)
- [ ] Test keyboard navigation
- [ ] Verify ARIA attributes

## Examples

See updated pages:
- `/hr/employees` — Full example with DataTable, Alert, PageHeader
- `/inventory/items` — DataTable with mobile-responsive columns
- `/purchasing/suppliers` — Simple list page
- `/finance/invoices` — Page with AI actions and KPI cards
- `/manufacturing/work-orders` — Page with AI insights card
- `/dashboard` — Dashboard with KPI cards

