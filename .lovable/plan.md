

## Plan: Add Demo Data to Routes, Students & Requests Pages

### Files to modify (4 total)

**1. `src/lib/demoData.ts`** — Add ~2,200 lines of mock data
- Add `DemoRoute` type alias and `getDemoRoutes()` with 47 Lawrence routes + 32 Oceanside routes
- Add `DemoRegistration` type alias and `getDemoStudents()` with 60 Lawrence + 40 Oceanside student registrations
- Add `DemoServiceRequest` type alias and `getDemoRequests()` with 20 Lawrence (14 open + 6 resolved) + 14 Oceanside (8 open + 6 resolved) service requests
- All data keyed by `DemoDistrictId`, matching existing patterns

**2. `src/pages/app/AppRoutes.tsx`** — Surgical demo mode insertion
- Import `useDemoMode`, `DemoDistrictId`, `getDemoRoutes`
- Add `const { isDemoMode, demoDistrictId } = useDemoMode()` in component
- Add demo early-return at top of `fetchRoutes` callback (with client-side filter/sort/pagination logic)
- Add demo early-return in the `allRoutes` useEffect (line 109-111)
- Add demo early-return in `fetchBusPasses` callback
- Add `isDemoMode`, `demoDistrictId` to relevant dependency arrays

**3. `src/pages/app/Students.tsx`** — Surgical demo mode insertion
- Import `useDemoMode`, `DemoDistrictId`, `getDemoStudents`
- Add demo early-return at top of `fetchStudents` callback with client-side search/filter/pagination
- Add demo guards on mutation functions (`performAction`, `saveFlags`, `handleAddStudent`, etc.) showing "disabled in demo mode" toast
- Add demo early-return for childcare reg IDs useEffect

**4. `src/pages/app/Requests.tsx`** — Surgical demo mode insertion
- Import `useDemoMode`, `DemoDistrictId`, `getDemoRequests`
- Add demo early-return at top of `fetchRequests` callback with client-side search/filter
- Add demo early-return in student options useEffect
- Add demo guards on `addNote`, `updateStatus`, `handleAdd` showing "disabled in demo mode" toast
- Add demo early-return for `openDetail` (show request details without Supabase notes query)

### Technical details

- All mock data generators will be pure functions returning static arrays (no randomization at runtime)
- Route distribution follows existing `tierData` counts exactly (Lawrence: 18/17/12, Oceanside: 13/11/8)
- Request counts match dashboard's `openRequests` and `urgentRequests` values
- Student names, addresses, and demographics are realistic Long Island data
- No files from the "DO NOT TOUCH" list will be modified

