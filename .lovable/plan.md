

# Current State: Residency Verification & Parent Registration/Reapply

Here is exactly what exists today and what still needs to be built.

## What is Already Built

### Public Registration (`/register`) — Fully Functional
A complete 6-step wizard exists at `/register` and works end-to-end:
1. **Parent Info** — name, email, phone, language, password (creates auth account)
2. **Student Info** — name, DOB, grade, school, IEP/504/McKinney-Vento/Foster Care flags; supports multiple students
3. **Address** — street, city, state, ZIP (with "will be geocoded after submission" notice)
4. **Documents** — upload 2+ residency documents (utility bill, lease, property tax, bank statement, vehicle registration, gov ID); stored in `residency-documents` storage bucket
5. **Childcare** — optional childcare provider transportation request
6. **Review & Sign** — summary, Parents' Bill of Rights acknowledgment, electronic signature (ESRA-compliant attestation under penalty of perjury)

On submit: creates auth account, inserts `student_registrations` (with `district_id`), uploads docs to `residency_documents`, creates `residency_attestations`, and optionally `childcare_requests`.

### Public Reapply (`/reapply`) — Fully Functional
A returning-family flow that:
- Requires login (email/password)
- Loads previous registrations from `student_registrations`
- Shows each student with auto-incremented grade (K→1, 1→2, etc.)
- "Same address" checkbox — if address changed, redirects to full registration
- Electronic signature + Bill of Rights acknowledgment
- Creates new `student_registrations` for the new school year with `district_id` carried forward

### Database Tables — All in Place
- `student_registrations` — has `district_id`, `parent_user_id`, all address/flag fields, status workflow (`pending`→`approved`/`denied`)
- `residency_documents` — linked to registration, stores file URLs
- `residency_attestations` — stores signature text, attestation text, timestamp
- `residency_audit_log` — admin review trail (approve/deny actions)
- `childcare_requests` — linked to registration
- RLS policies enforce parent-only insert/view and district-scoped staff access

### Admin Review (`/admin/residency`) — Exists
Staff can view pending registrations, approve/deny them, with audit logging.

## What is NOT Built (the Gaps)

### 1. In-App Parent Registration & Reapply — Placeholder Only
The sidebar routes at `/app/parent/register` and `/app/parent/reapply` are **placeholder pages** (just show "Register Student" / "Reapply for Transportation" text). Parents who are already logged into the portal cannot register or reapply from inside the app — they'd have to go to the public `/register` or `/reapply` URLs.

### 2. District Slug Lookup on Registration
The registration wizard hardcodes `districtId = "a1b2c3d4-..."`. It reads `?district=` from the URL but doesn't actually look it up in the `districts` table. A second district onboarding would fail.

### 3. No Reapply Link in Parent Sidebar
The sidebar has "Register" but no "Reapply" link for returning parents.

### 4. No Staff-Side Residency Review in `/app`
The residency review is only on the old `/admin/residency` route, not in the new `/app` system with district-scoped RLS.

## Proposed Plan

### Phase 1: Wire In-App Parent Register
Replace the placeholder `ParentRegister` page with the existing `RegisterWizard` component, but skip Step 1 (parent info / account creation) since the parent is already logged in. Pre-fill `parentName`, `email`, `phone` from the auth session and `district_id` from `useDistrict()`.

**Files:** `src/pages/app/parent/ParentRegister.tsx`

### Phase 2: Wire In-App Parent Reapply
Replace the placeholder `ParentReapply` page with the reapply logic from `/reapply`, but skip the login gate (user is already authenticated). Use `useAuth()` for user ID and `useDistrict()` for district context.

**Files:** `src/pages/app/parent/ParentReapply.tsx`

### Phase 3: Add Reapply to Parent Sidebar
Add a "Reapply" sidebar link for parent users, visible when they have at least one previous registration.

**Files:** `src/components/app/AppLayout.tsx`

### Phase 4: Dynamic District Lookup on Public Registration
Change the public `/register` wizard to resolve `?district=lawrence-ufsd` (slug) to the actual `district_id` by querying the `districts` table. Add a `slug` column to `districts` if needed.

**Files:** `src/components/registration/RegisterWizard.tsx`, plus a database migration to add `slug` column to `districts`

### Phase 5: Staff Residency Review in `/app`
Create an `/app/registrations` page (or `/app/admin/residency`) that shows pending registrations for the staff's district, with approve/deny actions and audit logging — all scoped by the new district RLS.

**Files:** New page `src/pages/app/admin/AppResidencyReview.tsx`, route in `App.tsx`

## Technical Details

- No new database tables needed — all tables exist with proper RLS
- The `RegisterWizard` needs a `mode` prop or similar to skip Step 1 when used in-app
- The `districts` table needs a `slug TEXT UNIQUE` column for URL-based lookup
- Parent insert policies on `student_registrations` already check `auth.uid() = parent_user_id`, so in-app inserts will work immediately
- Document uploads go to the existing `residency-documents` storage bucket

