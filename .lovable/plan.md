

# Priority 1: Multi-Tenant District Isolation

## Problem

Right now, **zero tables** in the `/app/*` system have a `district_id` column. The data tables (`routes`, `student_registrations`, `contracts`, `contract_invoices`, `contractor_insurance`, `contractor_performance`, `compliance_reports`, `compliance_training`, `mckinney_vento_students`, `ed_law_2d_contractors`, `safety_reports`, `route_stops`, `route_scenarios`) all use the old `has_role(auth.uid(), 'admin')` RLS — meaning any admin sees ALL data from ALL districts. If you onboard a second district, they see Lawrence's data. This is a blocker for selling to anyone.

The `districts` and `profiles` tables exist. The `district_user_roles` table exists. The helper functions `get_user_district_id()`, `get_user_role()`, and `has_app_role()` exist. The foundation is there — but nothing is wired to it.

## What Changes

### Phase A — Database Migration (single SQL migration)

Add `district_id UUID NOT NULL REFERENCES districts(id)` to these 13 tables:

```text
routes
student_registrations
contracts
contract_invoices       (via contract → district, or direct)
contractor_insurance    (via contract → district, or direct)
contractor_performance  (via contract → district, or direct)
compliance_reports
compliance_training
mckinney_vento_students
ed_law_2d_contractors
safety_reports
route_stops             (via route → district, or direct)
route_scenarios
```

For the tables that already have FK relationships to `contracts` or `routes` (like `contract_invoices`, `contractor_insurance`, `contractor_performance`, `route_stops`), we add `district_id` directly rather than doing joins in RLS — direct column is faster and simpler for RLS.

**Strategy for existing data:** All existing seeded data belongs to Lawrence UFSD. The migration will:
1. Add `district_id` as nullable
2. UPDATE all rows to set `district_id` = the Lawrence district UUID
3. ALTER to NOT NULL + add FK constraint

**New RLS policies** on each table (replacing old `has_role` ones):

- `SELECT`: `district_id = get_user_district_id()` (for staff+ via `has_app_role('staff')`)
- `INSERT`: `district_id = get_user_district_id()` AND `has_app_role('staff')`
- `UPDATE`: `district_id = get_user_district_id()` AND `has_app_role('staff')`
- `DELETE`: `district_id = get_user_district_id()` AND `has_app_role('district_admin')`

For `student_registrations`, keep the existing parent policies (parents can view/insert/update their own) and add district-scoped staff policies.

For `safety_reports` and similar public-insert tables, keep the `INSERT WITH CHECK (true)` policy but scope `SELECT/UPDATE` to district.

### Phase B — Frontend Changes

**No page code changes needed.** Because RLS enforces district isolation at the database level, every `supabase.from("routes").select(...)` call automatically returns only the current user's district data. The existing Dashboard, Students, Routes, Reports, Contracts, Compliance, and Settings pages work unchanged.

The only frontend change: when inserting new records (future features like "Add Route", "Add Contract"), the code must include `district_id` from `useDistrict().district.id`. But none of the current pages do inserts except Settings (profile update, which is already scoped by `user.id`).

### Phase C — Verify Parent Registration

The `student_registrations` table gets `district_id`. The `/register` flow currently doesn't set `district_id` — it will need updating:
- Accept `?district=<slug>` query param or have user select district
- Set `district_id` on the registration insert
- This is Priority 2 work but the schema change goes in now

## Files to Change

| File | Change |
|------|--------|
| New SQL migration | Add `district_id` to 13 tables, backfill Lawrence data, drop old RLS, create new district-scoped RLS |
| `src/integrations/supabase/types.ts` | Auto-regenerated after migration |

**No `.tsx` files need modification** — RLS handles everything transparently.

## Migration SQL Outline

```sql
-- 1. Get Lawrence district ID
-- 2. For each of 13 tables:
--    ALTER TABLE ADD COLUMN district_id UUID;
--    UPDATE SET district_id = <lawrence_id>;
--    ALTER COLUMN SET NOT NULL, ADD FK
-- 3. Drop all old has_role() policies on these tables
-- 4. Create new policies using get_user_district_id() + has_app_role()
-- 5. Special handling for student_registrations (keep parent policies)
-- 6. Special handling for safety_reports (keep public insert)
```

## What This Does NOT Touch

- `profiles`, `districts`, `district_user_roles` — already correct
- `user_roles` table — old admin system, stays
- All public pages, `/admin/*` routes — untouched
- All `/app/*` page components — unchanged (RLS is transparent)
- Edge functions — unchanged

## Risk Assessment

- **Low risk**: All existing data is Lawrence-only; backfill is deterministic
- **Breaking if wrong**: If `get_user_district_id()` returns NULL for the logged-in user, all queries return empty. The current user (A. Blumstein) already has a profile with `district_id` set, so this should work immediately.
- **Rollback**: Drop the new columns (data loss acceptable in dev)

