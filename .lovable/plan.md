

# Implementation Plan: Demo-Ready RideLine (4 Tasks)

This is a large, multi-task effort covering database seeding, data quality improvements, and two new UI flows. Here is the breakdown.

---

## Task 1: Seed Oceanside UFSD (Second Demo District)

**Goal:** Prove multi-tenant isolation by having two fully populated districts.

**Schema Changes Required First:**
Several tables referenced in the seed are missing `district_id` and cannot be tenant-isolated:
- `bids` — no `district_id` column
- `bid_responses` — no `district_id` column  
- `driver_reports` — no `district_id` column

These need `ALTER TABLE ... ADD COLUMN district_id UUID REFERENCES districts(id)` migrations + RLS policies before seeding.

**Database Migration (single large PL/pgSQL seed):**
1. Add `district_id` to `bids`, `bid_responses`, `driver_reports` tables
2. Add RLS policies for new columns
3. Backfill existing Lawrence data with Lawrence's `district_id`
4. Insert Oceanside district record
5. Insert 3 Oceanside profile records (with placeholder auth UUIDs + comments)
6. Insert 3 Oceanside contracts + insurance records
7. Use `generate_series()` + name/street arrays to generate:
   - ~5,179 student registrations across 10 schools
   - 85 routes distributed across schools and contractors
8. Insert 12 invoices with discrepancy stories
9. Insert 9 contractor performance records (3 contractors x 3 months)
10. Insert compliance data: 8 McKinney-Vento, 3 Ed Law 2-d, 6 training, 1 breach
11. Insert 8 safety reports + 5 driver reports
12. Insert 2 bids + 8 bid responses

All INSERTs use `ON CONFLICT DO NOTHING` for idempotency. Street names and student names drawn from Oceanside-specific arrays.

---

## Task 2: Tighten Lawrence UFSD Data Quality

**Database Migration (separate SQL, uses UPSERT patterns):**

A. **Contractor Performance:** Insert/upsert 24 records (4 contractors x 6 months Jul-Jan) with narrative arcs (Logan Bus declining, Baumann excellent on SPED).

B. **Compliance Data:** Upsert McKinney-Vento (12 records, 4 without transport), Ed Law 2-d for all 4 contractors (Logan missing privacy plan), 8+ compliance training records (2-3 overdue), 1 breach incident for Logan Bus.

C. **Route Storytelling:** Update specific Lawrence routes to create:
- 5 ghost routes with `total_students` < 50% of `capacity`
- 3 routes with `avg_ride_time_min` > 60
- 8 routes with low utilization (efficiency grade D/F)
- Merge candidate pairs serving same school

D. **Invoice Discrepancies:** Upsert Lawrence invoices so Logan Bus has 2 invoices with >$2K discrepancies, total discrepancies >$10K.

E. **Safety Reports:** Ensure 10 reports with priority mix (2 critical, 3 high, 3 medium, 2 low) and status mix.

F. **Bids:** Ensure 1 awarded + 1 open bid with responses and scoring.

---

## Task 3: Password Reset Flow

**Two new pages + route updates:**

### A. `/forgot-password` page
- New file: `src/pages/ForgotPassword.tsx`
- Navy background card matching `/login` design exactly
- RideLine logo, email input with Zod validation
- Calls `supabase.auth.resetPasswordForEmail()` with `redirectTo: origin + '/reset-password'`
- Success/error states without revealing email existence
- "Back to Sign In" link

### B. `/reset-password` page
- New file: `src/pages/ResetPassword.tsx`
- Same navy card design
- Two password fields with requirements display (8+ chars, uppercase, lowercase, number)
- Zod validation for matching + strength
- Calls `supabase.auth.updateUser({ password })`
- Success: auto-redirect to `/login` after 3 seconds
- Expired link error with link to `/forgot-password`

### C. Wiring
- Add both routes to `App.tsx` as public routes (between `/signup` and `/app`)
- Add "Forgot your password?" link to `Login.tsx` below the submit button
- Add to `robots.txt` disallow list
- Add breadcrumb labels in `AppBreadcrumb.tsx`

---

## Task 4: Profile Onboarding for New Users

### A. Onboarding check in `ProtectedRoute.tsx`
- After session confirmed, query `profiles` for user
- If no profile or missing `full_name`/`district_id` → redirect to `/app/onboarding`
- Cache result in `DistrictContext` (add `profileComplete` boolean)

### B. `/app/onboarding` page
- New file: `src/pages/app/Onboarding.tsx`
- Wrapped in `ProtectedRoute` but NOT in `AppLayout` (clean focused flow)
- Pre-fills name from auth metadata
- Shows role + district as read-only
- "Get Started" button upserts profile, then redirects to dashboard

### C. Edge case: no district association
- Show message: "Your account hasn't been linked to a district yet..."
- Sign Out link available

### D. Route addition
- Add `/app/onboarding` route in `App.tsx` inside the `ProtectedRoute` wrapper but OUTSIDE the `AppLayout` wrapper

---

## Technical Details

### Migration Strategy
- Tasks 1 & 2 will be a single large SQL migration using PL/pgSQL `DO $$` blocks with `generate_series()`, array indexing, and `random()` for realistic data generation
- Name arrays: 100 first names + 100 last names per district (non-overlapping)
- Address arrays: 30+ real street names per district
- All monetary values calibrated to Long Island rates ($70K-$100K/route/year)

### Schema Additions Required
```text
bids              + district_id UUID REFERENCES districts(id)
bid_responses     + district_id UUID REFERENCES districts(id)
driver_reports    + district_id UUID REFERENCES districts(id)
```

### New Files
```text
src/pages/ForgotPassword.tsx
src/pages/ResetPassword.tsx
src/pages/app/Onboarding.tsx
```

### Modified Files
```text
src/App.tsx                          (add 3 routes)
src/pages/Login.tsx                  (add forgot password link)
src/components/app/ProtectedRoute.tsx (add onboarding check)
src/contexts/DistrictContext.tsx      (add profileComplete flag)
src/components/app/AppBreadcrumb.tsx  (add labels)
public/robots.txt                    (add disallow entries)
```

### Execution Order
1. Schema migration (add missing `district_id` columns + RLS)
2. Seed migration (Oceanside + Lawrence tightening)
3. Frontend: Password reset pages + routes
4. Frontend: Onboarding page + ProtectedRoute logic

