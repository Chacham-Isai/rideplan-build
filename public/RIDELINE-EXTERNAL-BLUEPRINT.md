# RideLine — Full Project Blueprint for External AI Assistants

> **Last updated:** 2026-02-25
> **Purpose:** Give this file to any AI assistant (Claude, GPT, Cursor, etc.) so it can fully understand the RideLine project — architecture, tech stack, page flow, component tree, database schema, auth system, design system, current build state, wireframe logic, and capabilities.
> **Live preview:** https://rideplan-build.lovable.app
> **Project host:** Lovable (lovable.dev) with Lovable Cloud (Supabase-powered backend)

---

## 1. What Is RideLine?

RideLine is a **B2B SaaS platform** for K–12 school-district transportation management. It replaces spreadsheets, phone calls, and guesswork with a single command center.

**Three layers:**
1. **Public marketing website** (`/`) — high-conversion landing page + blog, demo, about, press, resources, careers, contact, privacy, terms
2. **Authenticated district portal** (`/app/*`) — multi-tenant dashboard with role-based access for district staff, admins, and parents
3. **Legacy admin panel** (`/admin/*`) — original admin system (still functional, separate auth)

**Key value propositions:**
- Route optimization → saves districts $710K–$1.6M in Year 1
- Real-time GPS tracking for parents (coming soon)
- AI-powered safety reporting & driver management
- Digital student registration & residency verification
- Contract management, invoicing, bid/RFP solicitation
- Compliance center (BEDS/STAC, McKinney-Vento, Ed Law 2-d)
- Coverage across the U.S. Northeast (expanding)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 5 (SWC plugin), dev server port 8080 |
| **Styling** | Tailwind CSS 3 + CSS custom properties (HSL tokens) |
| **UI Kit** | shadcn/ui (50+ Radix primitives) |
| **Animation** | Framer Motion 12 |
| **Routing** | React Router DOM 6 |
| **State / Data** | TanStack React Query 5 |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **SEO** | react-helmet-async |
| **Markdown** | react-markdown (blog content) |
| **Backend** | Lovable Cloud (Supabase) |
| **Auth** | Supabase Auth + Lovable Cloud OAuth (Google, Apple) |
| **OAuth library** | @lovable.dev/cloud-auth-js (managed, no API keys) |
| **Edge Functions** | Deno (Supabase Edge Functions) |
| **Path alias** | `@/` → `src/` |

---

## 3. Project Structure

```
├── public/
│   ├── favicon.ico, og-default.png, placeholder.svg
│   ├── robots.txt              # Disallows /admin/* and /app/*
│   └── sitemap.xml
├── scripts/generate-sitemap.ts
├── src/
│   ├── assets/                 # 13 static images (imported as ES6 modules)
│   ├── components/
│   │   ├── sections/           # 22 landing-page section components
│   │   │   ├── Navigation.tsx  # Auth-aware Login/Dashboard button
│   │   │   ├── HeroSection.tsx → CTASection.tsx → Footer.tsx
│   │   │   └── ... (AnnouncementBar, ByTheNumbers, ComparisonTable, etc.)
│   │   ├── app/                # Authenticated app shell
│   │   │   ├── AppLayout.tsx       # Sidebar + top bar
│   │   │   ├── AppBreadcrumb.tsx
│   │   │   ├── ProtectedRoute.tsx  # Auth gate → /login
│   │   │   ├── RoleGate.tsx        # Role-based access gate
│   │   │   └── PlaceholderPage.tsx
│   │   ├── admin/AdminLayout.tsx   # Legacy admin sidebar
│   │   ├── registration/           # RegisterWizard + 6 step components
│   │   ├── ui/                     # 50+ shadcn/ui primitives
│   │   ├── AnimatedRouteMap.tsx     # SVG animated bus routes
│   │   ├── DashboardAnimated.tsx    # Animated student assignment overlay
│   │   ├── ParentAppAnimated.tsx    # Animated notification overlays
│   │   ├── ChatWidget.tsx, ContactFormModal.tsx, ScrollReveal.tsx, etc.
│   ├── contexts/
│   │   ├── AuthContext.tsx     # session, user, loading, signOut
│   │   └── DistrictContext.tsx # district, profile, role, isAdmin, isStaff, isParent
│   ├── data/blogPosts.ts + additionalBlogPosts.ts  # 66 blog posts
│   ├── hooks/                  # use-mobile, use-toast, useCountUp, useScrollReveal
│   ├── integrations/
│   │   ├── lovable/index.ts    # Managed OAuth (auto-generated)
│   │   └── supabase/client.ts + types.ts  # Auto-generated, DO NOT EDIT
│   ├── pages/
│   │   ├── Index.tsx           # Homepage (22 lazy-loaded sections)
│   │   ├── Login.tsx           # Email + Google + Apple sign-in
│   │   ├── 17 more public pages (Blog, Demo, About, Contact, etc.)
│   │   ├── admin/              # 11 legacy admin pages
│   │   └── app/                # Authenticated portal pages
│   │       ├── Dashboard.tsx   # ✅ LIVE
│   │       ├── Students.tsx    # ✅ LIVE
│   │       ├── AppRoutes.tsx   # ✅ LIVE — routes, inefficiency detection, consolidation sim
│   │       ├── Contracts.tsx   # ✅ LIVE — 3 tabs (contracts, invoices, performance)
│   │       ├── Compliance.tsx  # ✅ LIVE — 4 tabs (BEDS/STAC, MV, Ed Law, Audit)
│   │       ├── Reports.tsx     # ✅ LIVE — 4 tabs (safety, driver, alerts, analytics)
│   │       ├── Settings.tsx    # ✅ LIVE — 4 tabs (district, subscription, users, privacy)
│   │       ├── parent/
│   │       │   ├── ParentDashboard.tsx  # ✅ LIVE — children cards, quick actions
│   │       │   ├── ParentRegister.tsx   # ✅ LIVE — in-app registration wizard
│   │       │   ├── ParentReapply.tsx    # ✅ LIVE — returning-family reapply
│   │       │   └── ParentTracking.tsx   # ✅ LIVE — coming soon preview w/ bus assignments
│   │       └── admin/
│   │           ├── AppResidencyAdmin.tsx # ✅ LIVE — residency review
│   │           ├── UsersAdmin.tsx        # ✅ LIVE — user/role management
│   │           ├── AppInvoicesAdmin.tsx   # ✅ LIVE — invoice verification + CSV export
│   │           └── AppBidsAdmin.tsx       # ✅ LIVE — bid management + scoring
│   ├── App.tsx                 # All routing definitions
│   ├── index.css               # Design system tokens (HSL)
│   └── main.tsx
├── supabase/
│   ├── config.toml
│   ├── migrations/             # Auto-managed SQL migrations
│   └── functions/
│       ├── chat/index.ts       # AI chatbot
│       └── analyze-reports/index.ts  # AI report analysis
├── RIDELINE-PROJECT-BLUEPRINT.md  # Internal blueprint (this is the external version)
├── tailwind.config.ts
└── vite.config.ts
```

---

## 4. Complete Routing Map

### Public Routes (no auth)

| Path | Component | Description |
|---|---|---|
| `/` | `Index` | Homepage — 22 lazy-loaded sections |
| `/contact` | `Contact` | Contact page |
| `/blog` | `Blog` | Blog listing (66 posts) |
| `/blog/:slug` | `BlogPost` | Individual blog article |
| `/demo` | `Demo` | Interactive 6-step product tour |
| `/resources` | `Resources` | Resource center |
| `/about` | `About` | About page |
| `/press` | `Press` | Press kit + brand assets |
| `/careers` | `Careers` | Careers page |
| `/privacy` | `Privacy` | Privacy policy |
| `/terms` | `Terms` | Terms of service |
| `/report` | `SafetyReport` | Public safety report form |
| `/driver-portal` | `DriverPortal` | Driver-facing portal |
| `/tip-driver` | `TipDriver` | Driver tipping page |
| `/register` | `Register` | Parent registration (6-step wizard) |
| `/reapply` | `Reapply` | Returning-family re-registration |
| `/login` | `Login` | Email/password + Google + Apple OAuth |
| `/signup` | `Signup` | Redirect to demo request |
| `*` | `NotFound` | 404 page |

### Authenticated App Routes (`/app/*`)

All wrapped in: `ProtectedRoute` → `DistrictProvider` → `AppLayout`

| Path | Component | Role | Status |
|---|---|---|---|
| `/app` | → redirect `/app/dashboard` | any | ✅ |
| `/app/dashboard` | `Dashboard` | any | ✅ **LIVE** — stat cards, charts, quick actions |
| `/app/students` | `Students` | any | ✅ **LIVE** — full CRUD, filters, detail/edit dialog |
| `/app/routes` | `AppRoutes` | any | ✅ **LIVE** — stats, inefficiency cards, route table, consolidation simulator |
| `/app/reports` | `Reports` | any | ✅ **LIVE** — 4 tabs: safety reports, driver reports, alerts, analytics charts |
| `/app/contracts` | `Contracts` | district_admin | ✅ **LIVE** — 3 tabs: contracts w/ detail dialog, invoices w/ approve/dispute, performance leaderboard |
| `/app/compliance` | `Compliance` | district_admin | ✅ **LIVE** — 4 tabs: BEDS/STAC generation, McKinney-Vento tracker, Ed Law 2-d, audit readiness |
| `/app/settings` | `AppSettings` | district_admin | ✅ **LIVE** — 4 tabs: district info, subscription, users, data & privacy |
| `/app/parent` | `ParentDashboard` | parent | ✅ **LIVE** — welcome, children cards, quick actions, activity timeline |
| `/app/parent/register` | `ParentRegister` | parent | ✅ **LIVE** — in-app registration wizard |
| `/app/parent/reapply` | `ParentReapply` | parent | ✅ **LIVE** — returning-family reapply with grade auto-increment |
| `/app/parent/tracking` | `ParentTracking` | parent | ✅ **LIVE** — coming soon page with animated bus, bus assignments |
| `/app/admin/users` | `UsersAdmin` | district_admin | ✅ **LIVE** — user table, role editing, invite flow, role distribution |
| `/app/admin/residency` | `AppResidencyAdmin` | district_admin | ✅ **LIVE** — debounced search, approve/deny with audit log |
| `/app/admin/invoices` | `AppInvoicesAdmin` | district_admin | ✅ **LIVE** — stats, filters, bulk approve, CSV export |
| `/app/admin/bids` | `AppBidsAdmin` | district_admin | ✅ **LIVE** — bid CRUD, response scoring, award workflow |

### Legacy Admin Routes (`/admin/*`)

| Path | Component |
|---|---|
| `/admin/login` | `AdminLogin` |
| `/admin` | `SafetyReportsAdmin` |
| `/admin/driver-reports` | `DriverReportsAdmin` |
| `/admin/residency` | `ResidencyAdmin` |
| `/admin/tips` | `TipsAdmin` |
| `/admin/alerts` | `AlertsAdmin` |
| `/admin/analytics` | `AnalyticsAdmin` |
| `/admin/contracts` | `ContractsAdmin` |
| `/admin/invoices` | `InvoicesAdmin` |
| `/admin/bids` | `BidsAdmin` |
| `/admin/routes` | `RoutesAdmin` |
| `/admin/compliance` | `ComplianceAdmin` |

---

## 5. Authentication & Multi-Tenancy

### Auth System
- **Provider:** Supabase Auth via Lovable Cloud
- **Methods:** Email/password, Google OAuth, Apple OAuth
- **OAuth library:** `@lovable.dev/cloud-auth-js` (managed, no API keys)
- **Context:** `AuthContext` wraps entire app → `session`, `user`, `loading`, `signOut`

### Multi-Tenancy (District Isolation)
Every user belongs to exactly ONE district. Every data table includes `district_id`. RLS ensures complete data isolation.

**Role hierarchy:** `super_admin` > `district_admin` > `transport_director` > `staff` > `parent` > `viewer`

**SQL helper functions (SECURITY DEFINER STABLE):**
- `get_user_district_id()` — returns caller's district_id
- `get_user_role()` — returns caller's role
- `has_app_role(required_role TEXT)` — hierarchical role check
- `has_role(_user_id, _role)` — legacy RBAC check

### React Context Architecture
```
<AuthProvider>                  ← wraps entire app
  <BrowserRouter>
    <ProtectedRoute>            ← checks session, redirects to /login
      <DistrictProvider>        ← fetches profile + district + role
        <AppLayout>             ← sidebar + top bar
          <RoleGate>            ← optional per-route role check
            <Page />
```

**`useDistrict()` provides:** `district`, `profile`, `isAdmin`, `isStaff`, `isParent`, `isSuperAdmin`, `isTransportDirector`

### App Shell (AppLayout)
- **Sidebar:** Navy (#151D33), collapsible, role-filtered nav items
- **Top bar:** District name, notification bell, user avatar dropdown
- **Content area:** Off-white (#F7F8FA) with breadcrumbs
- **Active item:** Gold left border + lighter navy background

---

## 6. Design System

### Color Tokens (HSL in index.css `:root`)

| Token | HSL | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `225 14% 97%` | #F7F8FA | Page background |
| `--foreground` | `224 40% 14%` | #151D33 | Body text (dark navy) |
| `--primary` | `226 42% 14%` | #151D33 | Primary navy |
| `--primary-foreground` | `210 40% 98%` | #F5F7FA | Text on primary |
| `--accent` | `37 91% 55%` | #F5A623 | Gold CTAs & highlights |
| `--success` | `155 66% 40%` | #22A06B | Green |
| `--destructive` | `7 93% 46%` | #DE350B | Error red |
| `--muted-foreground` | `217 18% 34%` | — | Secondary text |
| `--navy` | `226 42% 14%` | #0F1B2D | Brand navy alias |
| `--gold` | `37 91% 55%` | #F5A623 | Brand gold alias |

### Typography
| Role | Font |
|---|---|
| Display / Headings | **Playfair Display** (serif) → `font-display` |
| Body / UI | **DM Sans** (sans-serif) → `font-body` |

### Animation Patterns
- `ScrollReveal` — Framer Motion, 6 directions, 32px travel, 0.6s, triggers once
- `AnimatedStat` — count-up number animation on scroll
- `AnimatedRouteMap` — SVG buses moving along paths with `<animateMotion>`
- `DashboardAnimated` — staggered table rows with status transitions
- `ParentAppAnimated` — cycling notification toasts (spring animations)
- Navigation hover: animated underlines, scale effects on buttons

---

## 7. Database Schema (28 tables)

### Multi-tenant core

| Table | Purpose | RLS |
|---|---|---|
| `districts` | Tenant table (name, state, BEDS code, subscription) | Own district only |
| `profiles` | User profiles (extends auth.users) | Own row + district admin |
| `district_user_roles` | Role assignments per district | Own district only |
| `user_roles` | Legacy RBAC (admin/user) for /admin/* | Own only |

### Public-facing (anyone can insert)

| Table | Purpose |
|---|---|
| `audit_requests` | Lead capture form submissions |
| `safety_reports` | Safety incident reports |
| `driver_reports` | Driver-submitted reports |
| `driver_tips` | Tips from parents to drivers |
| `report_alerts` | Auto-generated alerts (admin read only) |

### Registration & residency

| Table | Purpose | RLS |
|---|---|---|
| `student_registrations` | Parent registration data (9,000+ records) | Parent-owned + district staff |
| `residency_documents` | Uploaded proof of residency | Parent-owned + district staff |
| `residency_attestations` | E-signed attestations | Parent-owned + district staff |
| `childcare_requests` | Childcare transport requests | Parent-owned + admin |
| `residency_audit_log` | Admin audit trail | Admin/staff only |

### Contracts & financial

| Table | Purpose |
|---|---|
| `contracts` | Contractor contracts |
| `contractor_insurance` | Insurance tracking |
| `contract_invoices` | Invoice verification (17 invoices, $5M+ total) |
| `contractor_performance` | Performance scorecards |
| `bids` | Bid/RFP solicitations |
| `bid_responses` | Contractor bid responses |

### Routes & operations

| Table | Purpose |
|---|---|
| `routes` | Route data & metrics (575 routes) |
| `route_stops` | Stop-level data with geocoding |
| `route_scenarios` | Consolidation simulation scenarios |

### Compliance

| Table | Purpose |
|---|---|
| `compliance_reports` | BEDS/STAC filings |
| `compliance_training` | Staff training tracking |
| `mckinney_vento_students` | Homeless student tracking |
| `ed_law_2d_contractors` | Data privacy agreements |
| `breach_incidents` | Data breach logs |

### Key Enums
`ai_priority` (low/medium/high/critical), `app_role` (admin/user), `audit_action` (approved/denied/flagged/requested_info/unflagged), `bid_status`, `bid_response_status`, `childcare_transport_type` (am/pm/both), `contract_status`, `driver_report_type`, `insurance_status`, `invoice_status`, `registration_status` (pending/approved/denied/under_review), `report_status`, `safety_report_type`

### Edge Functions

| Function | Purpose |
|---|---|
| `chat` | AI chatbot for visitor questions |
| `analyze-reports` | AI-powered report analysis |

### Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `residency-documents` | No | Parent-uploaded residency verification docs |

---

## 8. Current Build State — All Pages Live

### ✅ Fully Built & Functional

**Public Website:**
- Homepage with 22 lazy-loaded sections (scroll-spy nav, animated features, ROI calculator)
- Blog system (66 posts across 5 categories)
- Interactive 6-step product demo tour
- Parent registration 6-step wizard
- Safety report, driver portal, tip driver pages
- Contact, About, Press, Careers, Privacy, Terms, Resources pages
- SEO: helmet meta, OG tags, sitemap.xml, robots.txt

**Authentication:**
- Email/password + Google + Apple OAuth login
- Role-based redirect: parent → /app/parent, staff/admin → /app/dashboard
- Auth-aware navigation (Login/Dashboard button with outlined style)

**App Portal (`/app/*`) — ALL 16 PAGES LIVE:**

- **Dashboard** (`/app/dashboard`):
  - 4 clickable stat cards (Total Students, Active Routes, On-Time Rate, Pending Registrations)
  - Quick Actions bar (Add Student, Childcare Requests, Special Ed Pickups, Edit Requests)
  - Students by School bar chart + Route Tiers pie chart
  - Bottom stats (Total Daily Miles, Avg Ride Time, Avg Cost/Student)

- **Students** (`/app/students`):
  - Paginated table (50/page, 9,000+ records) with debounced search
  - Filters: status, school, special type
  - Clickable rows → detail dialog with edit mode for IEP/504/MV/FC flags
  - Add Student form, Add Childcare Pickup Request

- **Routes** (`/app/routes`):
  - Stats bar (Total Routes, Active, Avg Utilization, Total Miles, Avg Duration)
  - 4 inefficiency detection cards (Ghost Routes, Long Rides, High Dead Miles, Low Efficiency)
  - Route table with utilization progress bars, efficiency grades (A-F)
  - Filter by school, AM/PM, contractor, utilization level
  - Route detail dialog with capacity chart
  - Consolidation simulator: select 2+ routes → simulate merge → save scenario

- **Contracts** (`/app/contracts`) — 3 tabs:
  - **Contracts tab:** Stats bar, filterable contractor table with insurance/performance badges, contract detail dialog (terms, insurance, performance scorecard, rate comparison), Add Contract form
  - **Invoices tab:** Invoice table with approve/dispute workflow, monthly bar chart (invoiced vs verified)
  - **Performance tab:** Contractor leaderboard with on-time trend line chart

- **Compliance** (`/app/compliance`) — 4 tabs:
  - **BEDS/STAC Reports:** Generate report buttons, report history table
  - **McKinney-Vento:** Student tracker with compliance toggle switches, alert banner
  - **Ed Law §2-d:** Contractor dashboard, training tracker, breach log
  - **Audit Readiness:** 5 radial progress indicators + overall score, action items list

- **Reports** (`/app/reports`) — 4 tabs:
  - **Safety Reports:** Stats bar, filterable table, detail dialog with status update workflow
  - **Driver Reports:** Same pattern for driver-submitted reports
  - **Alerts:** Alert cards with dismiss functionality
  - **Analytics:** Line chart (trends), pie chart (type breakdown), bar chart (resolution time), top locations table

- **Settings** (`/app/settings`) — 4 tabs:
  - **District Info:** Profile editor + read-only district information display
  - **Subscription:** Current plan badge, trial info, tier comparison
  - **Users:** User table with role editing, invite flow, active toggles
  - **Data & Privacy:** Ed Law §2-d compliance status, Parents' Bill of Rights accordion

- **Parent Dashboard** (`/app/parent`):
  - Welcome message with parent name
  - Quick action buttons: Register Child, Reapply Next Year, Track Bus, Notifications
  - My Children cards: student name, grade, school, status badge, address, school year
  - Shows all registered children (approved, pending, denied)

- **Parent Register** (`/app/parent/register`):
  - In-app registration wizard (reuses RegisterWizard pattern)
  - Pre-populated with parent profile data

- **Parent Reapply** (`/app/parent/reapply`):
  - Fetches previous year registrations
  - Auto-increments grade, "same address?" toggle
  - Single attestation e-signature for all children

- **Parent Tracking** (`/app/parent/tracking`):
  - "GPS Tracking Launching Soon" with animated bus illustration (Framer Motion)
  - Bus assignment cards for each approved child
  - Feature preview cards (Live Map, ETA Updates, Notifications)

- **Admin Users** (`/app/admin/users`):
  - Full user table with search, role distribution badges
  - Role editing via dropdown, active toggle
  - Invite User dialog

- **Admin Residency** (`/app/admin/residency`):
  - Searchable registration review with debounced search (350ms)
  - Approve/deny with audit logging

- **Admin Invoices** (`/app/admin/invoices`):
  - Stats: Total Invoiced ($5M+), Total Verified, Discrepancies, Pending count
  - Full invoice table with status filters
  - Bulk approve with checkboxes
  - CSV export (client-side Blob download)

- **Admin Bids** (`/app/admin/bids`):
  - Bid CRUD with status summary cards (Draft, Open, Closed, Awarded)
  - Create Bid form dialog
  - Bid detail with responses table, scoring system
  - Award workflow

**Legacy Admin (`/admin/*`):**
- 11 fully functional sub-pages (safety reports, driver reports, residency audit, tips, alerts, analytics, contracts, invoices, bids, routes, compliance)

**Backend:**
- 28 database tables with comprehensive RLS policies
- Multi-tenant isolation via district_id
- Hierarchical role system with SQL helper functions
- File storage bucket for residency documents

### 🔲 Not Yet Built (Future Features)

- Password reset flow (`/reset-password`)
- Profile onboarding for new users
- Real-time GPS bus tracking (ParentTracking page is a "coming soon" preview)
- Real-time subscriptions (Supabase Realtime)
- Push notification system
- Dark mode (not planned — navy sections provide contrast)

---

## 9. Wireframe & UI Patterns

### Dashboard Layout
```
┌────────────────────────────────────────────────────┐
│ [Logo]  Lawrence Union Free School District  🔔 👤 │
├──────┬─────────────────────────────────────────────┤
│      │ Home > Dashboard                            │
│ 🏠   │                                             │
│ 👥   │ ┌─────────┐┌─────────┐┌─────────┐┌────────┐│
│ 🗺️   │ │Students ││Routes   ││On-Time  ││Pending ││
│ 📊   │ │ 8,302   ││538/575  ││93%      ││697     ││
│ 📋   │ │ +3.2%   ││99%      ││+1.4%    ││Action! ││
│ 📄   │ └─────────┘└─────────┘└─────────┘└────────┘│
│ ⚙️   │                                             │
│      │ Quick Actions                               │
│      │ [+ Add] [Childcare] [Sp.Ed] [Edits]        │
│      │                                             │
│      │ ┌──── Students by School ────┐┌─ Tiers ──┐ │
│      │ │ [bar chart]               ││ [donut]   │ │
│      │ └───────────────────────────┘└───────────┘ │
│      │                                             │
│      │ ┌─ Miles ──┐┌─ Ride Time ─┐┌─ Cost ──────┐│
│      │ │ 7,111    ││ 30 min      ││ $1,099      ││
│      │ └──────────┘└─────────────┘└─────────────┘│
└──────┴─────────────────────────────────────────────┘
```

### Students Page Layout
```
┌──────┬──────────────────────────────────────────────┐
│      │ Students (9,000 total)          [+ Add Btn]  │
│      │ [Search...] [Status▼] [School▼] [Type▼]     │
│      │                                              │
│      │ Name      Grade  School    Address  Status   │
│      │ ────────────────────────────────────────     │
│      │ Sophia N.   5    LECC      16 Atl.. Denied  │
│      │ Liam D.     K    LMS       11 Cen.. Approved│
│      │ ...                                          │
│      │ Showing 1-50 of 9,000        < 1/180 >      │
└──────┴──────────────────────────────────────────────┘
```

### Parent Dashboard Layout
```
┌──────┬──────────────────────────────────────────────┐
│      │ Welcome back, A.                             │
│      │ Manage your children's transportation        │
│      │                                              │
│      │ [Register] [Reapply] [Track Bus] [Notifs]   │
│      │                                              │
│      │ My Children                                  │
│      │ ┌─────────────────────┐┌────────────────────┐│
│      │ │ Sophia Nelson       ││ Liam Davis         ││
│      │ │ Grade 5 · LECC     ││ Grade K · LMS      ││
│      │ │ 16 Atlantic Ave    ││ 11 Central Ave     ││
│      │ │ 2025-2026  Denied  ││ 2025-2026 Approved ││
│      │ └─────────────────────┘└────────────────────┘│
└──────┴──────────────────────────────────────────────┘
```

### Navigation (Public Site)
```
[Logo] Platform Features Safety Pricing How-It-Works Demo Resources About Blog [Login] [Get Free Audit]
```
- Login button: outlined primary border, fills on hover
- Get Free Audit: solid primary background
- Scroll-spy active highlighting on section links
- Mobile: animated hamburger → X with staggered link animations

---

## 10. Data Flow Patterns

### Student Management Flow
```
Dashboard Quick Action → /app/students?filter=childcare (or ?action=add)
  → Students page reads URL params, sets filter/opens dialog
  → Supabase query with server-side filters (.eq, .or, .in, .ilike)
  → Paginated results (50/page)
  → Click row → fetch childcare_requests for that registration
  → Edit flags → supabase.update() → toast notification → refresh
  → Add childcare → supabase.insert() → toast → refresh detail
```

### Auth Flow
```
/login → email/password or OAuth → Supabase Auth session
  → AuthContext.onAuthStateChange sets session
  → Navigate to /app/dashboard (or /app/parent for parents)
  → ProtectedRoute checks session → DistrictProvider fetches profile
  → AppLayout renders sidebar filtered by role
  → RoleGate blocks unauthorized routes
```

### RLS Data Access
```
User logs in → auth.uid() available
  → get_user_district_id() returns district_id from profiles
  → Every query filtered: WHERE district_id = get_user_district_id()
  → has_app_role() checks hierarchical permissions
  → Parents: can only see own registrations (parent_user_id = auth.uid())
  → Staff+: can see all district data
```

### Contract/Invoice Flow
```
/app/contracts → Contracts tab → table with insurance/performance badges
  → Click row → detail dialog (terms, insurance, scorecard, rate comparison)
  → Invoices tab → approve/dispute updates status + reviewed_by
  → Performance tab → leaderboard + on-time trend chart
```

### Compliance Flow
```
/app/compliance → BEDS/STAC tab → "Generate" button
  → Queries student_registrations + routes → creates compliance_reports record
  → McKinney-Vento tab → toggle switches update transportation_provided
  → Audit Readiness tab → calculates % scores from all compliance data
```

---

## 11. Key Technical Decisions

1. **No dark mode** — Navy sections provide sufficient contrast
2. **No self-serve signup** — Districts onboarded by sales team
3. **Dual admin systems** — Legacy `/admin/*` uses `has_role()` + `user_roles`; new `/app/*` uses `has_app_role()` + `district_user_roles`
4. **Client-side blog** — 66 posts stored in TypeScript files, no CMS
5. **All homepage cards clickable** — Navigate to /demo or open audit modal
6. **Childcare filter is server-side** — First fetches registration IDs from childcare_requests, then uses `.in()` for server-side filtering
7. **Debounced search** — 350ms delay on search inputs to reduce API calls
8. **HSL design tokens** — All colors defined as HSL in index.css, referenced via Tailwind semantic classes
9. **Supabase types are auto-generated** — Never edit `src/integrations/supabase/types.ts`
10. **Edge functions auto-deploy** — No manual deployment needed
11. **Direct Supabase queries** — Pages use `useCallback` + `useEffect` pattern (not React Query hooks) for data fetching, matching established codebase conventions
12. **Currency formatting** — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
13. **Pagination** — 50 records per page with offset-based pagination

---

## 12. What an External AI Should Know

### DO:
- Use Tailwind semantic tokens (`text-foreground`, `bg-primary`, etc.) — never hardcode colors
- Follow the existing component patterns (shadcn/ui Card, Dialog, Table, Button, Badge, Tabs, etc.)
- Use `supabase` client from `@/integrations/supabase/client`
- Use `useDistrict()` for district/profile/role context
- Use `useAuth()` for session/user
- Include `district_id` from `useDistrict().district.id` in all INSERT calls
- Add RLS policies for any new tables
- Use the existing design system fonts (Playfair Display headings, DM Sans body)
- Use sonner toast notifications for success/error feedback
- Use Recharts for any charts

### DON'T:
- Edit `src/integrations/supabase/client.ts` or `types.ts` (auto-generated)
- Edit `package.json` directly (use package manager tools)
- Edit `.env` or `supabase/config.toml` (auto-managed)
- Use raw colors in components — always use design tokens
- Create tables without district_id (breaks multi-tenancy)
- Manually filter by district_id in SELECT queries (RLS handles it)
- Replace the existing auth, routing, or app shell architecture

### Current Live District Data:
- **District:** Lawrence Union Free School District
- **Students:** 8,302 registered (9,000 total registrations including denied/pending)
- **Routes:** 575 total (538 active), across 7 schools
- **Tiers:** 191 Tier 1, 192 Tier 2, 192 Tier 3
- **On-Time Rate:** 93%
- **Total Daily Miles:** 7,111
- **Avg Ride Time:** 30 min
- **Avg Cost/Student:** $1,099
- **Contracts:** Multiple active contractors (Atlantic Express, Logan Bus, Varsity Transit, Baumann & Sons)
- **Invoices:** 17 invoices totaling $5M+, with $11.9K in discrepancies found
- **Users:** 1 district admin (A. Blumstein)

---

## 13. Conversion Strategy

- **Primary CTA:** "Get Free Audit" / "Start Your Free Route Audit"
- **No explicit pricing** — personalized assessments highlighting potential savings
- **ROI messaging:** Based on generalized district parameters (5,000 students, 45 routes)
- **Projected savings:** $710K–$1.6M in Year 1
- Districts are NOT self-serve — onboarded by RideLine's sales team

---

*End of external blueprint. Updated 2026-02-25.*
