

# Plan: Build All 12 Remaining Placeholder Pages

## Scope

Replace every placeholder page in the app with fully functional implementations. This covers 12 pages across staff, admin, and parent portals — all working inside the existing `AppLayout` shell with existing auth, RLS, and design patterns.

## Technical Approach

All pages follow the established patterns from Dashboard, Students, and ResidencyAdmin:
- Direct Supabase queries (RLS handles district scoping on SELECT; INSERT includes `district_id`)
- `useCallback` + `useEffect` for data fetching (matching existing pattern — not switching to React Query mid-build to stay consistent with what's already in production)
- Debounced search (350ms), pagination (50/page), sonner toasts
- shadcn/ui components: Card, Table, Dialog, Tabs, Badge, Button, Input, Switch
- Recharts for charts, same styling as Dashboard
- Currency formatting via `Intl.NumberFormat`, dates via `toLocaleDateString`

## Files to Create/Edit

### New Page Files (12 files)

1. **`src/pages/app/Contracts.tsx`** — 3-tab page (Contracts, Invoices, Performance)
   - Stats bar, filterable contractor table with insurance/performance badges
   - Contract detail dialog with terms, insurance, performance scorecard, rate comparison
   - Add Contract form dialog
   - Invoice tab with add/approve/dispute workflow, monthly bar chart
   - Performance tab with leaderboard, on-time trend line chart

2. **`src/pages/app/AppRoutes.tsx`** — Routes management (replaces placeholder)
   - Stats bar, filter bar (school, AM/PM, contractor, utilization)
   - Route table with utilization progress bars, efficiency grades
   - 4 inefficiency detection cards (Ghost Routes, Long Rides, High Dead Miles, Low Efficiency)
   - Route detail dialog with capacity chart
   - Consolidation simulator: checkbox select → simulate merge → save scenario

3. **`src/pages/app/Compliance.tsx`** — 4-tab page (BEDS/STAC, McKinney-Vento, Ed Law 2-d, Audit Readiness)
   - Report generation buttons that create compliance_reports records
   - McKinney-Vento student tracker with toggle switches
   - Ed Law 2-d contractor dashboard with training tracker and breach log
   - Audit Readiness tab with 5 radial progress indicators + overall score

4. **`src/pages/app/Reports.tsx`** — 4-tab page (Safety, Driver, Alerts, Analytics)
   - Safety/driver report tables with status update workflow
   - Alert cards with dismiss functionality
   - Analytics tab with 4 Recharts visualizations (line, pie, bar, table)

5. **`src/pages/app/Settings.tsx`** — 4-tab page (District Info, Subscription, Users, Data & Privacy)
   - Editable district info form
   - Subscription display with tier badge
   - User management table with role editing and invite flow
   - Data & privacy section with Ed Law 2-d summary

6. **`src/pages/app/parent/ParentDashboard.tsx`** — Parent home
   - Welcome message, My Children cards from student_registrations
   - Quick action buttons, notification timeline, tracking preview card

7. **`src/pages/app/parent/ParentRegister.tsx`** — Already exists with RegisterWizard, keep as-is

8. **`src/pages/app/parent/ParentReapply.tsx`** — Reapply flow
   - Fetch previous year registrations, show cards with auto-incremented grades
   - Same address toggle, re-attestation signature, submit new records

9. **`src/pages/app/parent/ParentTracking.tsx`** — Coming Soon placeholder
   - Styled feature preview with bus assignment info per child
   - Map placeholder illustration, animated bus icon

10. **`src/pages/app/admin/AppInvoicesAdmin.tsx`** — Deep invoice analysis
    - Full invoice table with date range, contractor, status, discrepancy filters
    - Bulk approve with checkboxes
    - CSV export (client-side Blob download)
    - Discrepancy summary stats

11. **`src/pages/app/admin/AppBidsAdmin.tsx`** — Bid management
    - Active bids list with create form
    - Bid detail with responses table, scoring system
    - Award bid workflow that creates a contract record

12. **`src/pages/app/admin/UsersAdmin.tsx`** — Dedicated user management
    - Full user table with search, role distribution badges
    - Invite user flow, bulk deactivate

### Files to Edit

13. **`src/components/app/AppBreadcrumb.tsx`** — Add labels for new page segments (compliance, performance, tracking, bids, etc.)

14. **`src/App.tsx`** — Update imports to point to real page components instead of PlaceholderPage. Route structure stays identical.

## Database Changes

No new tables or migrations needed. All 28 tables already exist with appropriate RLS policies. The existing `route_scenarios` table supports the consolidation simulator. All compliance tables (`compliance_reports`, `mckinney_vento_students`, `ed_law_2d_contractors`, `compliance_training`, `breach_incidents`) are ready.

## Implementation Order

Due to the size, implementation will proceed in batches:
1. **Batch 1**: Contracts, Routes, Reports (staff-facing, data-heavy pages)
2. **Batch 2**: Compliance, Settings (admin pages with multiple tabs)
3. **Batch 3**: Parent Dashboard, Reapply, Tracking (parent portal)
4. **Batch 4**: Admin Invoices, Admin Bids, Admin Users (dedicated admin pages)
5. **Batch 5**: Breadcrumb updates, App.tsx import cleanup

## Design Consistency

Every page will use:
- `text-2xl font-bold text-foreground` for page headings
- `Card className="border-0 shadow-sm"` for containers
- Same stat card pattern as Dashboard (icon + label + value + trend)
- Same table pattern as Students (loading spinner, empty state, pagination footer)
- Same filter bar pattern (search left, dropdowns right)
- Same Dialog pattern for detail views
- Status badges with consistent color coding (emerald=good, amber=warning, red=bad)
- `space-y-6` for vertical rhythm between sections

