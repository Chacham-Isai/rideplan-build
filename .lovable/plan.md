

# Complete Authentication & Multi-Tenant Architecture Plan

This is a major architectural change that introduces multi-tenancy (district isolation), a new auth system with profiles, a full app shell, and new routing — while preserving all existing public pages untouched.

---

## Overview

The work breaks into 5 major areas executed in sequence:

1. **Database migration** — new tables, functions, RLS policies
2. **Auth context & district provider** — React contexts for session/district/role
3. **Login/Signup pages** — styled to match existing design system
4. **App shell layout** — sidebar, top bar, breadcrumbs for `/app/*` routes
5. **Routing & placeholder pages** — wire everything into `App.tsx`, nav update

---

## 1. Database Migration (single SQL migration)

**New tables:**
- `districts` — tenant table with subscription fields, BEDS code, contact info
- `profiles` — extends `auth.users` with `district_id`, `role`, `full_name`, `email`, `phone`, `title`, `is_active`

**New SQL functions (all `SECURITY DEFINER STABLE`):**
- `get_user_district_id()` — returns the caller's district_id from profiles
- `get_user_role()` — returns the caller's role text from profiles
- `has_app_role(required_role TEXT)` — hierarchical role check (super_admin > district_admin > transport_director > staff > parent > viewer)

**RLS policies:**
- `districts`: SELECT only where `id = get_user_district_id()`
- `profiles`: SELECT own row always; SELECT all in district for district_admin+; INSERT/UPDATE own row

**Trigger:** `update_updated_at_column` on both new tables.

**Note:** The existing `user_roles` table and `has_role(uuid, app_role)` function remain untouched — the old `/admin/*` routes continue to work. The new `has_app_role(text)` function is separate and serves the new `/app/*` multi-tenant system.

---

## 2. Auth & District Context (new files)

### `src/contexts/AuthContext.tsx`
- Wraps `onAuthStateChange` listener (set up before `getSession()`)
- Provides `session`, `user`, `loading`, `signOut` 
- Used by ProtectedRoute

### `src/contexts/DistrictContext.tsx`
- Fetches profile + district from database after auth is confirmed
- Provides: `district` object, `profile` object, convenience booleans (`isAdmin`, `isStaff`, `isParent`, `isSuperAdmin`, `isTransportDirector`)
- `useDistrict()` hook for child components

### `src/components/app/ProtectedRoute.tsx`
- Checks AuthContext — no session → redirect `/login`
- Checks if profile exists — no profile → redirect `/login` with error toast
- If valid, renders `<Outlet />` wrapped in `DistrictContext`

### `src/components/app/RoleGate.tsx`
- Takes `requires` prop (role string)
- Uses `useDistrict()` to check role hierarchy
- Renders children or a styled "Access Denied" card

---

## 3. Login & Signup Pages

### `src/pages/Login.tsx` (`/login`)
- Navy background with subtle grid pattern (CSS background-image)
- Centered card with RideLine logo, Playfair Display heading
- Email + password inputs (shadcn Input), gold "Sign In" button
- "Forgot Password?" link (placeholder for now)
- "Don't have an account? Contact us for a demo" → `/demo`
- On success: fetch profile, redirect to `/app/dashboard` (staff/admin) or `/app/parent` (parent role)

### `src/pages/Signup.tsx` (`/signup`)
- Same navy card styling
- "Ready to transform your district's transportation?" heading
- Subtitle about RideLine working directly with districts
- Gold CTA "Request Your Free Route Audit" → `/demo`
- "Already have an account? Sign in" → `/login`

---

## 4. App Shell Layout

### `src/components/app/AppLayout.tsx`
- Left sidebar: navy background (`#151D33`), RideLine logo, nav items with icons
- Nav items filtered by role:
  - **All roles:** Dashboard
  - **staff+:** Students, Routes, Reports
  - **district_admin+:** Contracts, Compliance, Settings
  - **parent:** Dashboard, My Students, Register, Track Bus
- Active item: gold left border + lighter navy background
- Sidebar collapsible (icon-only on tablet, hamburger overlay on mobile)
- Top bar: district name, notification bell, user avatar dropdown (Profile, Settings, Log Out)
- Content area: off-white `#F7F8FA` background, breadcrumb navigation
- Uses `<Outlet />` for child routes

---

## 5. Routing & Navigation Updates

### `App.tsx` changes
All existing routes remain **completely untouched**. New routes added:

```text
/login → Login
/signup → Signup
/app → ProtectedRoute wrapper (with AppLayout)
  /app (index) → redirect to /app/dashboard
  /app/dashboard → DashboardPlaceholder
  /app/students → StudentsPlaceholder
  /app/routes → AppRoutesPlaceholder
  /app/contracts → RoleGate(district_admin) → ContractsPlaceholder
  /app/compliance → RoleGate(district_admin) → CompliancePlaceholder
  /app/reports → ReportsPlaceholder
  /app/settings → RoleGate(district_admin) → SettingsPlaceholder
  /app/parent → ParentDashboardPlaceholder
  /app/parent/register → ParentRegisterPlaceholder
  /app/parent/reapply → ParentReapplyPlaceholder
  /app/parent/tracking → ParentTrackingPlaceholder
  /app/admin/users → RoleGate(district_admin) → UsersAdminPlaceholder
  /app/admin/residency → RoleGate(district_admin) → ResidencyPlaceholder
  /app/admin/invoices → RoleGate(district_admin) → InvoicesPlaceholder
  /app/admin/bids → RoleGate(district_admin) → BidsPlaceholder
```

### `Navigation.tsx` update
- Add auth state check (lightweight — just check session existence)
- Before the "Get Free Audit" button: show "Login" link (if not logged in) or "Dashboard" link (if logged in)
- Same styling in mobile menu

### Placeholder pages
- One shared `PlaceholderPage` component that takes `title` and `breadcrumbs` props
- Shows page title (Playfair Display), "Coming Soon" badge, breadcrumb path
- Wrapped in AppLayout automatically via Outlet

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth session provider |
| `src/contexts/DistrictContext.tsx` | District + profile provider with `useDistrict()` |
| `src/components/app/ProtectedRoute.tsx` | Auth gate for `/app/*` |
| `src/components/app/RoleGate.tsx` | Role-based access gate |
| `src/components/app/AppLayout.tsx` | App shell with sidebar + top bar |
| `src/components/app/AppBreadcrumb.tsx` | Breadcrumb navigation |
| `src/components/app/PlaceholderPage.tsx` | Reusable "Coming Soon" page |
| `src/pages/Login.tsx` | Login page |
| `src/pages/Signup.tsx` | Signup page |
| `src/pages/app/Dashboard.tsx` | Dashboard placeholder |
| `src/pages/app/Students.tsx` | Students placeholder |
| `src/pages/app/AppRoutes.tsx` | Routes placeholder |
| `src/pages/app/Contracts.tsx` | Contracts placeholder |
| `src/pages/app/Compliance.tsx` | Compliance placeholder |
| `src/pages/app/Reports.tsx` | Reports placeholder |
| `src/pages/app/Settings.tsx` | Settings placeholder |
| `src/pages/app/parent/ParentDashboard.tsx` | Parent dashboard placeholder |
| `src/pages/app/parent/ParentRegister.tsx` | Parent register placeholder |
| `src/pages/app/parent/ParentReapply.tsx` | Parent reapply placeholder |
| `src/pages/app/parent/ParentTracking.tsx` | Parent tracking placeholder |
| `src/pages/app/admin/UsersAdmin.tsx` | Users admin placeholder |
| `src/pages/app/admin/ResidencyAdmin.tsx` | Residency admin placeholder |
| `src/pages/app/admin/InvoicesAdmin.tsx` | Invoices admin placeholder |
| `src/pages/app/admin/BidsAdmin.tsx` | Bids admin placeholder |
| Migration SQL file | districts, profiles, functions, RLS |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/login`, `/signup`, `/app/*` routes; wrap app in AuthProvider |
| `src/components/sections/Navigation.tsx` | Add Login/Dashboard link based on auth state |
| `public/robots.txt` | Add `Disallow: /app/` |
| `public/sitemap.xml` | Add `/login` route |

## What is NOT Modified

All existing public pages, components, admin pages (`/admin/*`), the existing `user_roles` system, edge functions, and database tables remain completely untouched.

---

## Technical Details

### Role Hierarchy
`super_admin` > `district_admin` > `transport_director` > `staff` > `parent` > `viewer`

The `has_app_role()` function implements cascading permissions so `super_admin` passes all checks, `district_admin` passes for `transport_director` and below, etc. The `parent` role is treated as a lateral role (not in the staff hierarchy).

### Auth Flow
1. User visits `/login`, enters credentials
2. `supabase.auth.signInWithPassword()` called
3. `onAuthStateChange` fires → AuthContext updates
4. ProtectedRoute detects session → fetches profile from `profiles` table
5. DistrictContext populated with district + profile data
6. Redirect based on role: parent → `/app/parent`, others → `/app/dashboard`

### District Isolation
- Every future data table gets a `district_id UUID NOT NULL REFERENCES districts(id)` column
- RLS policy pattern: `district_id = get_user_district_id()`
- App code never manually filters by district — RLS enforces automatically
- The `get_user_district_id()` function is `SECURITY DEFINER` to avoid RLS recursion on the profiles table

### Seed Data
The migration will include a commented-out INSERT for "Meadowbrook Central School District" that can be run manually. It won't auto-execute.

