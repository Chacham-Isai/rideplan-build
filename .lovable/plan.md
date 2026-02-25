

# Phase 2: Comprehensive Implementation Plan (8 Tasks)

This is the full Phase 2 implementation covering demo infrastructure, route visualization, data import, board reports, notifications, AI integration, and polish. The plan follows the priority order specified in the prompt for maximum demo impact.

---

## Task 1: Demo Login Switcher

### Database Changes
- Create `demo_sessions` table with `original_user_id`, `impersonating_district_id`, `impersonating_role`, `is_active`, timestamps
- RLS: only super_admin can INSERT/SELECT/UPDATE
- Create `get_demo_district_id()` SECURITY DEFINER function that checks for active demo session, falls back to `get_user_district_id()`
- Update ALL existing RLS policies (across all 34+ tables) to reference `get_demo_district_id()` instead of `get_user_district_id()` — non-demo users unaffected since it falls through

### Frontend Changes
- **`src/contexts/DistrictContext.tsx`** — On mount, query `demo_sessions` for active session. If found, override district and role with impersonated values. Add `demoActive`, `demoDistrict`, `endDemo()`, `startDemo()` to context interface.
- **`src/components/app/AppLayout.tsx`** — Add "Demo" button (outline, next to bell) visible only to super_admin. Opens dialog with district dropdown + role dropdown + Start/End buttons. Render amber sticky banner when demo active: "DEMO MODE — Viewing as [District] ([Role]) [End Demo]"
- **`src/pages/DemoLogin.tsx`** (new) — Public `/demo-login` route with two district cards (Lawrence / Oceanside) each with "Enter as Admin" and "Parent View" toggle. Signs in as shared demo account, activates demo session.
- **`src/App.tsx`** — Add `/demo-login` route

### Files Modified
`supabase/migrations/[new].sql`, `src/contexts/DistrictContext.tsx`, `src/components/app/AppLayout.tsx`, `src/pages/DemoLogin.tsx` (new), `src/App.tsx`

---

## Task 2: Route Map Visualization

### Dependencies
- Install `react-leaflet`, `leaflet`, `@types/leaflet`
- Add Leaflet CSS link in `index.html`

### Frontend Changes
- **`src/components/app/RouteMap.tsx`** (new) — Lazy-loaded Leaflet map component:
  - Centers on district geocoordinates (Lawrence: 40.6159/-73.7296, Oceanside: 40.6388/-73.6400)
  - Plots route_stops as color-coded circle markers by route
  - Click popup: address, route number, students, time
  - Route selector dropdown draws polyline connecting stops in order, colored by efficiency grade (A=green through F=red)
  - Filter controls: school, contractor, efficiency grade multi-select, "Ghost Routes Only" toggle
  - School markers as distinct icons at hardcoded locations
  - Fetches stops in batches by route

- **`src/pages/app/AppRoutes.tsx`** — Add third tab "Map" with lazy-loaded RouteMap component inside Suspense with skeleton fallback

- **`src/pages/app/parent/ParentTracking.tsx`** — Replace/supplement animated bus with static Leaflet map showing student's assigned route stops, their stop highlighted, and "Live tracking coming Q2 2026" note

### Files Modified
`index.html`, `src/components/app/RouteMap.tsx` (new), `src/pages/app/AppRoutes.tsx`, `src/pages/app/parent/ParentTracking.tsx`

---

## Task 3: Route Scenarios Seed Data

### Database Changes (migration)
- Insert 3 Oceanside route scenarios (merge OC-012+013, consolidate OC-045-047, eliminate OC-071) with realistic savings and utilization data
- Check and insert 3 Lawrence route scenarios (merge L-023+024, consolidate L-089-091, eliminate L-112) if missing
- All with appropriate district_id references, status (draft/approved)

### Files Modified
`supabase/migrations/[new].sql`

---

## Task 4: Data Import System

### Dependencies
- Install `xlsx` (SheetJS) for Excel parsing

### Database Changes
- Create `import_log` table with district_id, imported_by, data_type, file_name, total/imported/skipped/error row counts
- RLS: staff can SELECT, district_admin can INSERT

### Frontend Changes
- **`src/pages/app/admin/ImportData.tsx`** (new) — 4-step wizard:
  1. Select data type (students, routes, stops, contracts, performance) with template download
  2. Upload file (drag-drop, .csv/.xlsx/.xls/.tsv, 10MB limit, client-side Excel parsing via SheetJS)
  3. Map & validate: preview table, auto-map columns (fuzzy matching), Zod validation with real-time error/warning counts
  4. Confirm & import: batch INSERT (100 rows) with district_id, ON CONFLICT DO NOTHING, progress bar, summary

- **CSV templates** generated on-the-fly from exportToCsv with correct headers + 2-3 example rows

- **`src/components/app/AppLayout.tsx`** — Add "Import Data" nav item (Upload icon, district_admin only)
- **`src/App.tsx`** — Add `/app/admin/import` route with RoleGate

### Files Modified
`supabase/migrations/[new].sql`, `src/pages/app/admin/ImportData.tsx` (new), `src/components/app/AppLayout.tsx`, `src/App.tsx`

---

## Task 5: Board Presentation Export

### Frontend Changes
- **`src/components/app/BoardReportGenerator.tsx`** (new) — Dialog component:
  - 8 section checkboxes (executive summary, financial, benchmarks, routes, contractors, compliance, safety, requests)
  - Date range selector
  - "Generate Report" button fetches all data via existing Supabase queries
  - Compiles into HTML (with inline CSS, tables, formatted metrics) and Markdown
  - Downloads as `[District]_Board_Report_[Date].html` and `.md` via Blob

- **`src/pages/app/Dashboard.tsx`** — Add "Generate Board Report" button in Quick Actions (district_admin only), opens BoardReportGenerator dialog

### Files Modified
`src/components/app/BoardReportGenerator.tsx` (new), `src/pages/app/Dashboard.tsx`

---

## Task 6: Notification Bell System

### Database Changes
- Create `notifications` table with district_id, user_id (nullable for broadcast), title, message, type (urgent/warning/info/success), category, link, is_read
- RLS: users can SELECT/UPDATE own notifications (user_id = auth.uid() OR user_id IS NULL) within their district
- Create `generate_system_notifications()` PL/pgSQL function that scans expired certs, expiring insurance, pending invoices, urgent requests, MV compliance gaps — inserts notifications with dedup (7-day window)
- Run function once to seed notifications for both districts
- Manually seed additional notifications per prompt spec

### Frontend Changes
- **`src/components/app/AppLayout.tsx`** — Wire up bell icon:
  - Badge count (red circle with unread count), fetched on mount + every 60s
  - Popover dropdown on click: scrollable list with colored left borders, title/message/timestamp/"2 hours ago", unread blue dot
  - "Mark All Read" link in header
  - Click item navigates to `notification.link` and marks read
  - Empty state: "All caught up!"
  - Demo mode integration: show notifications for impersonated district

### Files Modified
`supabase/migrations/[new].sql`, `src/components/app/AppLayout.tsx`

---

## Task 7: AI Integration

### Database Changes
- Add `ai_suggested_priority` and `ai_suggested_type` columns to `service_requests`

### Edge Function Changes
- **`supabase/functions/triage-request/index.ts`** (new) — Receives subject + description, calls Lovable AI (gemini-3-flash-preview) to suggest priority + type + reasoning, returns JSON

### Frontend Changes
- **`src/pages/app/Requests.tsx`** — After creating a request, call triage-request edge function, update request with AI suggestions, show "AI Triage" badge in detail dialog if AI suggested differently

- **`src/pages/app/Reports.tsx`** — Safety tab: Add "AI Analysis" button that sends last 30 days of safety reports to analyze-reports function, displays pattern detection results in Alert card

- **`src/pages/app/Communications.tsx`** — "Draft with AI" button next to notes textarea when logging outbound comms, calls chat edge function, pre-fills draft

- **`src/pages/app/Contracts.tsx`** — Invoice discrepancy "Why?" link, sends invoice details to analyze-reports, shows AI explanation in popover

### Files Modified
`supabase/migrations/[new].sql`, `supabase/functions/triage-request/index.ts` (new), `src/pages/app/Requests.tsx`, `src/pages/app/Reports.tsx`, `src/pages/app/Communications.tsx`, `src/pages/app/Contracts.tsx`

---

## Task 8: Polish & Demo Readiness

### A. Loading Skeletons
- Audit all 20 /app/* pages, replace spinner-only states with shadcn Skeleton components (cards, table rows, charts, map placeholder)

### B. Error Boundaries
- Create `src/components/app/ErrorBoundary.tsx` — wraps page sections with friendly error message + retry button

### C. Mobile Responsiveness
- Ensure tables wrapped in `overflow-x-auto`, stat cards stack 2x2 on tablet / 1-col on mobile, dialogs full-screen on small screens, Quick Actions wrap to 2-col

### D. Keyboard Shortcuts
- `Ctrl/Cmd+K`: Command palette (shadcn Command/cmdk — already installed) searching students, routes, requests
- `Ctrl/Cmd+N`: New service request
- `Escape`: Close dialogs
- `?`: Show shortcuts overlay
- **`src/components/app/CommandPalette.tsx`** (new) — cmdk-based search across 3 entity types with debounced parallel queries

### E. Print Stylesheet
- Add `@media print` rules to `src/index.css`: hide sidebar/topbar/demo-banner, full-width content, no page-break mid-row, logo header, URL footer

### F. Accessibility
- Add aria-labels to interactive elements, verify focus rings, color contrast, alt text

### G. PWA Metadata
- Add `public/manifest.json` with app name, start_url `/app/dashboard`, standalone display
- Add apple-touch-icon link in `index.html`

### Files Modified
All 20 /app/* page files (skeleton additions), `src/components/app/ErrorBoundary.tsx` (new), `src/components/app/CommandPalette.tsx` (new), `src/index.css`, `index.html`, `public/manifest.json` (new), `src/components/app/AppLayout.tsx`

---

## Implementation Order

```text
Step 1: Migration (Tasks 1+3+6 DB) — demo_sessions, notifications, route_scenarios, RLS updates
Step 2: Task 1 Frontend — DistrictContext demo override, AppLayout demo UI, DemoLogin page
Step 3: Task 6 Frontend — Notification bell UI in AppLayout
Step 4: Task 2 — Leaflet map (install deps, RouteMap component, AppRoutes tab, ParentTracking)
Step 5: Task 5 — Board report generator component + Dashboard button
Step 6: Task 4 — Import system (install xlsx, import_log migration, ImportData page, sidebar nav)
Step 7: Task 7 — AI integration (triage edge function, AI buttons on 4 pages)
Step 8: Task 8 — Polish pass (skeletons, error boundaries, mobile, shortcuts, print, a11y, PWA)
```

## New Files Created
- `src/pages/DemoLogin.tsx`
- `src/components/app/RouteMap.tsx`
- `src/components/app/BoardReportGenerator.tsx`
- `src/components/app/CommandPalette.tsx`
- `src/components/app/ErrorBoundary.tsx`
- `src/pages/app/admin/ImportData.tsx`
- `supabase/functions/triage-request/index.ts`
- `public/manifest.json`
- 2-3 SQL migration files

## NPM Packages to Install
- `react-leaflet`, `leaflet`, `@types/leaflet`
- `xlsx`

