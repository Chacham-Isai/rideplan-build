

# Plan: Demo-Ready Implementation (6 Tasks)

This is a large, multi-task implementation covering seed data, new UI features, and polish. Here is the breakdown.

---

## Task 1: Seed Oceanside UFSD (Full Second District)

**Single SQL migration** using PL/pgSQL `DO $$ ... $$` block with idempotency check (`IF NOT EXISTS (SELECT 1 FROM districts WHERE slug = 'oceanside-ufsd')`).

Seeds all 34 tables for Oceanside with the exact data specified in the prompt:
- District record (Oceanside UFSD, slug `oceanside-ufsd`, 5,179 students, professional tier)
- 3 profiles (placeholder UUIDs — district_admin, staff, parent) + district_user_roles
- ~5,179 student registrations across 10 schools using `generate_series()` with arrays of 120 first/last names, Oceanside streets, correct status/flag distributions
- 85 routes (OC-001 to OC-085) with 3 contractors, realistic metrics
- 850 route stops (~10 per route) with Oceanside geocoordinates (40.63-40.65, -73.62 to -73.66)
- 12 route aides on SPED routes
- 150 bus passes linked to approved registrations
- 3 contracts (Nassau Student Transport, South Shore Bus Co., Island Transit Services)
- 3 contractor insurance records (South Shore expiring within 30 days for alert)
- 12 invoices with discrepancies
- 9 contractor performance records (3 months × 3 contractors)
- 15 service requests with notes
- 10 communication log entries
- 25 driver certifications (including 3 expiring, 2 expired)
- 8 safety reports, 5 driver reports
- 6 McKinney-Vento students (4 with transport, 2 without)
- 3 Ed Law 2-d contractor records (South Shore non-compliant)
- 8 compliance training records (2 overdue)
- 1 breach incident (South Shore)
- 2 bids with responses
- 5 report alerts
- Target: ~48% audit readiness

## Task 2: Tighten Lawrence UFSD Data

**Same migration file** (or second migration). Inserts additional data using `INSERT ... ON CONFLICT DO NOTHING` or existence checks:

- Contractor performance: 6 months (Jul 2025 - Jan 2026) for all 4 contractors with story arcs (Logan Bus declining)
- Compliance: 12+ MV students, Ed Law 2-d for all 4 contractors (Logan non-compliant), training records, 1 breach incident
- Route inefficiency patterns: ensure 5+ ghost routes at <50%, 3+ long rides >60 min, merge candidates
- Invoice discrepancies: Logan Bus >$2K discrepancies, total >$10K
- Safety reports: 10+ with variety
- Bid data: 1 awarded, 1 open
- Service requests: ensure all 6 types covered with notes
- Communication log: 8+ with all channel/contact types
- Driver certs: 2 expired + 4 expiring within 30 days
- Target: ~68% audit readiness

## Task 3: Parent Service Request Submission

**Database changes:**
- Add RLS policies on `service_requests`: parents can INSERT with their own `parent_user_id` and SELECT where `parent_user_id = auth.uid()`
- Add RLS policy on `service_request_notes`: parents can SELECT notes linked to their requests

**UI changes in `src/pages/app/parent/ParentDashboard.tsx`:**
- Add "Submit a Request" button in quick actions grid
- Add request submission dialog with: type dropdown (stop_change, address_change, bus_pass, general_inquiry only), subject, description, student dropdown (from parent's children)
- Auto-set priority to 'normal', status to 'open'
- Add "My Requests" section below children cards showing parent's submitted requests with status badges
- Click to see detail with staff notes

## Task 4: Bulk Bus Pass Generation

**UI changes in `src/pages/app/AppRoutes.tsx`:**
- Add "Generate Bus Passes" button (visible to district_admin role only)
- Bulk generation dialog: scope selector (all approved or by school), school year dropdown, preview count, generate button
- Queries approved students without active passes, bulk inserts bus_passes
- Add "Bus Passes" tab with table: student name, school, route, bus #, status, issued date
- Search, filter by school/status, revoke button, CSV export

## Task 5: Cross-District Benchmarking

**Database changes:**
- Create `get_regional_benchmarks()` SQL function (SECURITY DEFINER) returning anonymized averages across all districts

**UI changes in `src/pages/app/Contracts.tsx`:**
- Add "Regional Benchmark" card showing your district vs regional average for rate/route, on-time %, utilization
- Green/red indicators for above/below average
- "Based on N districts and M routes"

**UI changes in `src/pages/app/Dashboard.tsx`:**
- Add benchmark line in Business workflow card

## Task 6: Data Quality Polish & Demo Readiness

**A. Dashboard action items** — Already implemented; seed data ensures correct items appear per district.

**B. Data leakage verification** — Include verification queries in the migration (informational, not blocking).

**C. Sidebar badge counts in `src/components/app/AppLayout.tsx`:**
- Fetch counts on mount for: open requests, pending registrations, expiring contracts/insurance
- Store in component state, refresh every 5 minutes
- Render small circular badges on sidebar nav icons

**D. CSV export on all table pages:**
- Add "Export CSV" button to: Students, Routes, Compliance MV tab, Requests, Communications
- Client-side CSV generation from current query results using Blob + download pattern

**E. Empty state improvements:**
- Create reusable `EmptyState` component with icon, message, and CTA button
- Apply to all table pages (Students, Routes, Requests, Communications, etc.)

---

## Implementation Order

1. **Migration file** (Tasks 1 + 2) — single large SQL migration
2. **Task 3** — Parent request submission (RLS + ParentDashboard.tsx)
3. **Task 5** — Benchmarking function + Contracts/Dashboard UI
4. **Task 4** — Bus pass generation UI in Routes page
5. **Task 6C** — Sidebar badges in AppLayout
6. **Task 6D** — CSV export buttons on all table pages
7. **Task 6E** — Empty state component + integration

## Files Modified

- `supabase/migrations/[new].sql` — Oceanside seed + Lawrence gap fill + benchmarking function + RLS policies
- `src/pages/app/parent/ParentDashboard.tsx` — Request submission + My Requests section
- `src/pages/app/AppRoutes.tsx` — Bus pass generation + Bus Passes tab
- `src/pages/app/Contracts.tsx` — Regional benchmark card
- `src/pages/app/Dashboard.tsx` — Benchmark summary line
- `src/components/app/AppLayout.tsx` — Sidebar badge counts
- `src/pages/app/Students.tsx` — CSV export + empty state
- `src/pages/app/Requests.tsx` — CSV export + empty state
- `src/pages/app/Communications.tsx` — CSV export + empty state
- `src/components/app/EmptyState.tsx` — New reusable component

