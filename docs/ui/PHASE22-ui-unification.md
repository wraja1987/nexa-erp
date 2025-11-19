# Phase 22 — UI/UX Modernisation + Unification

**Last updated**: 2025-11-16

## Purpose

Establish a unified, modern, dense, and consistent design system for Nexa ERP, ensuring all pages follow the same visual language, use smart tables, and provide a cohesive user experience.

## Who Should Read This

- Frontend developers implementing UI components
- Designers reviewing component specifications
- QA engineers validating UI consistency
- Product managers reviewing UX patterns

---

## Design System Blueprint

### Color Palette

#### Primary Colors
- **nexaPrimary**: `#2563eb` (Electric Blue) — Primary actions, links, active states
- **nexaPrimarySoft**: `#3b82f6` (Lighter Blue) — Hover states, subtle highlights
- **nexaPrimaryDark**: `#1d4ed8` (Darker Blue) — Pressed states
- **nexaAccent**: `#7c3aed` (Violet) — Accent elements, gradients
- **nexaGradient**: `linear-gradient(180deg, #2E6BFF 0%, #7A4DFF 100%)` — Sidebar, hero sections

#### Neutral Colors
- **nexaBg**: `#ffffff` (White) — Main background
- **nexaSurface**: `#f8fafc` (Light Gray) — Card backgrounds, elevated surfaces
- **nexaBorder**: `#e5e7eb` (Gray Border) — Borders, dividers
- **nexaMutedText**: `#6b7280` (Gray Text) — Secondary text, captions
- **nexaText**: `#0f172a` (Dark Text) — Primary text

#### Semantic Colors
- **nexaSuccess**: `#10b981` (Green) — Success states, positive indicators
- **nexaWarning**: `#f59e0b` (Amber) — Warning states, caution
- **nexaDanger**: `#ef4444` (Red) — Error states, destructive actions
- **nexaInfo**: `#3b82f6` (Blue) — Informational messages

#### Subtle/Strong States
- **Subtle**: 10% opacity overlays, muted backgrounds
- **Strong**: Full opacity, bold text, prominent borders

---

### Typography Scale

#### Headings
- **headingLg**: `text-3xl font-semibold` (30px) — Page titles
- **headingMd**: `text-xl font-semibold` (20px) — Section titles
- **headingSm**: `text-lg font-medium` (18px) — Subsection titles

#### Body Text
- **body**: `text-base` (16px) — Primary body text
- **bodySm**: `text-sm` (14px) — Secondary body text, table cells
- **caption**: `text-xs` (12px) — Captions, metadata, timestamps

#### Font Weights
- **Regular**: `400` — Body text
- **Medium**: `500` — Emphasized text
- **Semibold**: `600` — Headings, labels
- **Bold**: `700` — Strong emphasis (rare)

---

### Spacing System (4px Scale)

- **xs**: `4px` (0.25rem) — Tight spacing, icon padding
- **sm**: `8px` (0.5rem) — Small gaps, compact lists
- **md**: `16px` (1rem) — Standard spacing, card padding
- **lg**: `24px` (1.5rem) — Large gaps, section spacing
- **xl**: `32px` (2rem) — Extra large gaps, page margins
- **2xl**: `48px` (3rem) — Maximum spacing, major sections

#### Usage Examples
- Card padding: `p-6` (24px)
- Button padding: `px-4 py-2` (16px horizontal, 8px vertical)
- Section spacing: `space-y-4` (16px vertical)
- Page margins: `px-8` (32px horizontal)

---

### Border Radius

- **sm**: `6px` — Small elements (badges, chips)
- **md**: `8px` — Buttons, inputs
- **lg**: `12px` — Cards, modals
- **xl**: `16px` — Large cards, panels
- **2xl**: `20px` — Extra large cards, hero sections

---

### Shadows

- **card**: `0 2px 14px rgba(2, 6, 23, 0.06)` — Card elevation
- **popover**: `0 10px 30px rgba(0, 0, 0, 0.15)` — Dropdowns, modals
- **elevated**: `0 4px 20px rgba(0, 0, 0, 0.1)` — Floating elements

---

## Component Library

### Button

**Variants**:
- `primary` — Primary actions (blue background, white text)
- `secondary` — Secondary actions (outline, blue border)
- `subtle` — Tertiary actions (transparent, hover background)
- `destructive` — Destructive actions (red background)

**Sizes**: `sm`, `md`, `lg`

**States**: Default, hover, active, disabled, loading

**Keyboard**: Full keyboard support (Enter/Space to activate, Tab navigation)

**Example**:
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>
```

---

### Input, Textarea, Select

**Features**:
- Standardized padding, border, focus states
- Error states (red border, error message)
- Label and helper text support
- Placeholder styling

**Example**:
```tsx
<Input
  label="Email"
  placeholder="user@example.com"
  error={errors.email}
  helperText="Enter your email address"
/>
```

---

### Card

**Structure**:
- Header (optional title, subtitle, actions)
- Content (main body)
- Footer (optional actions, metadata)

**Styling**: 2xl rounded corners, subtle shadow, white background

**Example**:
```tsx
<Card>
  <Card.Header title="Invoice Details" />
  <Card.Content>
    {/* Content */}
  </Card.Content>
</Card>
```

---

### Tabs

**Features**:
- Horizontal tabs with underline indicator
- Keyboard accessible (Arrow keys, Tab)
- ARIA attributes for screen readers

**Example**:
```tsx
<Tabs>
  <Tabs.Tab id="overview" label="Overview" />
  <Tabs.Tab id="details" label="Details" />
</Tabs>
```

---

### Badge

**Variants**: `success`, `warning`, `danger`, `info`, `neutral`

**Example**:
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

---

### Modal / Dialog

**Features**:
- Centered overlay
- Close button (X) and ESC key support
- Focus trap
- ARIA attributes (`role="dialog"`, `aria-labelledby`)

**Example**:
```tsx
<Modal open={isOpen} onClose={handleClose} title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <Modal.Footer>
    <Button variant="subtle" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

---

### Alert / Banner

**Variants**: `error`, `warning`, `info`, `success`

**Example**:
```tsx
<Alert variant="error" title="Error">
  Failed to save changes. Please try again.
</Alert>
```

---

### Skeleton

**Usage**: Loading placeholders for tables, cards, lists

**Example**:
```tsx
<Skeleton className="h-10 w-full" />
```

---

## Layout Patterns

### Global App Shell

**Structure**:
```
┌─────────────────────────────────────────┐
│ [Logo]  Sidebar  │  Header (Search, User) │
├─────────────────────────────────────────┤
│                                         │
│  Breadcrumb → Page Title                │
│  [Toolbar Actions]                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Filters Row                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Card                            │   │
│  │  ┌───────────────────────────┐   │   │
│  │  │  DataTable                │   │   │
│  │  └───────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [AI Engine Bar (fixed bottom)]        │
└─────────────────────────────────────────┘
```

**Components**:
- **AppShell** — Root container with sidebar + main area
- **Sidebar** — Left navigation (260px width, gradient background)
- **Header** — Top bar (search, notifications, user menu)
- **PageHeader** — Breadcrumb + title + toolbar
- **AIEngineBar** — Fixed bottom bar for AI interactions

---

### Page Sections

**Standard Structure**:
```tsx
<PageHeader
  title="Inventory – Items"
  breadcrumb={["Inventory", "Items"]}
  actions={[
    <Button variant="primary">New Item</Button>,
    <Button variant="secondary">Import</Button>
  ]}
/>

<main className="space-y-4 px-8 pb-24">
  <FiltersRow>
    <Input placeholder="Search..." />
    <Select options={statusOptions} />
  </FiltersRow>

  <Card>
    <DataTable columns={columns} data={data} />
  </Card>
</main>
```

---

### Mobile Breakpoints

- **sm**: `640px` — Small tablets
- **md**: `768px` — Tablets
- **lg**: `1024px` — Small desktops
- **xl**: `1280px` — Desktops

**Responsive Patterns**:
- Tables: Horizontal scroll with sticky headers on mobile
- Filters: Collapse into dropdown/accordion on small screens
- Cards: Stack vertically, no horizontal overflow
- Sidebar: Collapse to hamburger menu on mobile
- Columns: Hide non-essential columns on small screens (with "more details" drill-down)

---

## Accessibility Checklist

### Keyboard Navigation
- ✅ All interactive elements keyboard accessible
- ✅ Tab order logical and predictable
- ✅ Focus indicators visible (2px ring, primary color)
- ✅ ESC closes modals/dropdowns
- ✅ Enter/Space activates buttons

### ARIA Attributes
- ✅ `role` attributes where appropriate
- ✅ `aria-label` for icon-only buttons
- ✅ `aria-labelledby` for form fields
- ✅ `aria-expanded` for collapsible sections
- ✅ `aria-current` for active navigation items

### Contrast Ratios
- ✅ Text on background: WCAG AA (4.5:1 minimum)
- ✅ Large text: WCAG AA (3:1 minimum)
- ✅ Interactive elements: Clear focus states

### Screen Reader Support
- ✅ Semantic HTML (headings, lists, landmarks)
- ✅ Alt text for images
- ✅ Form labels associated with inputs

### Validated Pages
- ✅ Finance invoices list
- ✅ Inventory items list
- ✅ HR employees list
- ✅ Admin security page

---

## Page Audit

| Route | Module | Layout OK? | Using DataTable? | AI Inline Actions? | Mobile & A11y OK? | Notes |
|-------|--------|------------|------------------|-------------------|-------------------|-------|
| `/dashboard` | Dashboard | ✅ | ❌ | ❌ | ✅ | Updated with PageHeader, Card, KpiCard |
| `/finance/invoices` | Finance | ✅ | ✅ | ✅ | ✅ | Updated with PageHeader, DataTable, InlineAiAction |
| `/finance/ap/bills` | Finance | ⚠️ | ❌ | ❌ | ⚠️ | Uses basic table, needs DataTable |
| `/finance/gl` | Finance | ⚠️ | ❌ | ❌ | ⚠️ | Journal entries list |
| `/banking/accounts` | Banking | ⚠️ | ❌ | ❌ | ⚠️ | Bank accounts list |
| `/banking/statements` | Banking | ⚠️ | ❌ | ❌ | ⚠️ | Statement lines |
| `/inventory/items` | Inventory | ✅ | ✅ | ❌ | ✅ | Updated with PageHeader, DataTable, Alert |
| `/inventory/transfers` | Inventory | ⚠️ | ❌ | ❌ | ⚠️ | Transfers list |
| `/manufacturing/work-orders` | Manufacturing | ✅ | ✅ | ✅ | ✅ | Updated with PageHeader, DataTable, InlineAiAction |
| `/purchasing/suppliers` | Purchasing | ✅ | ✅ | ❌ | ✅ | Updated with PageHeader, DataTable |
| `/purchasing/orders` | Purchasing | ⚠️ | ❌ | ❌ | ⚠️ | Purchase orders |
| `/hr/employees` | HR | ✅ | ✅ | ❌ | ✅ | Updated with PageHeader, DataTable, Alert |
| `/hr/payroll` | HR | ⚠️ | ❌ | ❌ | ⚠️ | Payroll runs |
| `/pos/register` | POS | ⚠️ | ❌ | ❌ | ⚠️ | POS interface |
| `/pos/receipts` | POS | ⚠️ | ❌ | ❌ | ⚠️ | Receipts list |
| `/tax/vat` | Tax | ⚠️ | ❌ | ❌ | ⚠️ | VAT returns |
| `/analytics/dashboard` | Analytics | ⚠️ | ❌ | ❌ | ⚠️ | KPI dashboard |
| `/ai/overview` | AI | ⚠️ | ❌ | ❌ | ❌ | AI overview page |
| `/admin/security` | Admin | ⚠️ | ❌ | ❌ | ⚠️ | Security settings |
| `/healthcare/overview` | Healthcare | ⚠️ | ❌ | ❌ | ⚠️ | Healthcare overview |
| `/import-export` | Import/Export | ⚠️ | ❌ | ❌ | ⚠️ | Import/export interface |
| `/attachments` | Attachments | ⚠️ | ❌ | ❌ | ⚠️ | Attachments list |
| `/ops/observability` | Ops | ⚠️ | ❌ | ❌ | ⚠️ | Observability dashboard |

**Migration Pattern**: All pages should follow this structure:
```tsx
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Card, CardContent } from "@/components/ui/Card";

export default async function MyPage() {
  // Fetch data...
  return (
    <>
      <PageHeader title="..." breadcrumb={[...]} actions={...} />
      <main className="space-y-4 px-8 pb-24">
        <DataTable columns={...} data={...} />
      </main>
    </>
  );
}
```

**Legend**:
- ✅ Complete
- ⚠️ Needs work
- ❌ Not implemented

---

## Implementation Notes

### Nexa Logo Behavior
- Fixed at top-left of sidebar
- High-res asset (`/logo-nexa.png`)
- Clicking logo logs out and redirects to `https://www.nexaai.co.uk`
- Consistent size: 120px width, 28px height

### Inline AI Actions
- Standard component: `InlineAiAction` (chip/button)
- Standard panel: `InlineAiPanel` (output display)
- All AI UI checks `AI_ENGINE_ENABLED` and RBAC
- Graceful degradation when AI disabled

### Schema Gap Messaging
- Use unified `Alert` component for unsupported features
- Professional messaging: "This feature is currently limited by the underlying data model and is read-only in this build."
- No "TODO" or "Coming soon" placeholders

### Button States
- Every button either performs a real action OR is visibly disabled with tooltip
- No dead buttons or commented placeholders

---

## Next Steps

1. ✅ Create design system blueprint (this document)
2. ⏳ Implement unified theme + component library
3. ⏳ Refactor global app shell
4. ⏳ Create DataTable component
5. ⏳ Update all pages to use unified components
6. ⏳ Add inline AI actions
7. ⏳ Ensure responsiveness and accessibility
8. ⏳ Clean up legacy UI and add tests

---

**Status**: Design blueprint complete. Ready for implementation.

