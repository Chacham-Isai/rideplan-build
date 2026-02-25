# RideLine — Full Project Blueprint for External AI Assistants

> **Last updated:** 2026-02-25 (Phase 1–6 workflow automation complete)
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
- Service request hub for secretarial workflow automation
- Communication logging for audit trails
- 19A driver certification tracking
- Bus pass generation & eligibility management
- Aide & monitor assignment per route

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
│   │   │   ├── AppLayout.tsx       # Sidebar + top bar (staffNav + parentNav)
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
│   │       ├── Dashboard.tsx   # ✅ Operational Command Center
│   │       ├── Students.tsx    # ✅ LIVE
│   │       ├── AppRoutes.tsx   # ✅ LIVE — routes, inefficiency detection, consolidation sim
│   │       ├── Contracts.tsx   # ✅ LIVE — 3 tabs (contracts, invoices, performance)
│   │       ├── Compliance.tsx  # ✅ LIVE — 4 tabs (BEDS/STAC, MV, Ed Law, Audit)
│   │       ├── Reports.tsx     # ✅ LIVE — 4 tabs (safety, driver, alerts, analytics)
│   │       ├── Requests.tsx    # ✅ NEW — Service Request Hub
│   │       ├── Communications.tsx # ✅ NEW — Communication Log
│   │       ├── Settings.tsx    # ✅ LIVE — 4 tabs (district, subscription, users, privacy)
│   │       ├── Onboarding.tsx  # ✅ LIVE — new user onboarding flow
│   │       ├── parent/
│   │       │   ├── ParentDashboard.tsx  # ✅ LIVE
│   │       │   ├── ParentRegister.tsx   # ✅ LIVE
│   │       │   ├── ParentReapply.tsx    # ✅ LIVE
│   │       │   └── ParentTracking.tsx   # ✅ LIVE — coming soon preview
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
├── RIDELINE-PROJECT-BLUEPRINT.md  # Internal blueprint
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
| `/forgot-password` | `ForgotPassword` | Password reset request |
| `/reset-password` | `ResetPassword` | Password reset completion |
| `*` | `NotFound` | 404 page |

### Authenticated App Routes (`/app/*`)

All wrapped in: `ProtectedRoute` → `DistrictProvider` → `AppLayout`

| Path | Component | Role | Status |
|---|---|---|---|
| `/app` | → redirect `/app/dashboard` | any | ✅ |
| `/app/onboarding` | `Onboarding` | any | ✅ **LIVE** — outside AppLayout, focused new-user flow |
| `/app/dashboard` | `Dashboard` | any | ✅ **LIVE** — Operational Command Center (5 workflow areas) |
| `/app/students` | `Students` | any | ✅ **LIVE** — full CRUD, filters, detail/edit dialog |
| `/app/routes` | `AppRoutes` | any | ✅ **LIVE** — stats, inefficiency cards, route table, consolidation simulator |
| `/app/requests` | `Requests` | staff+ | ✅ **NEW** — Service Request Hub (stop/address/school changes, driver issues) |
| `/app/communications` | `Communications` | staff+ | ✅ **NEW** — Communication Log (phone/email/text/in-person) |
| `/app/reports` | `Reports` | any | ✅ **LIVE** — 4 tabs: safety reports, driver reports, alerts, analytics charts |
| `/app/contracts` | `Contracts` | district_admin | ✅ **LIVE** — 3 tabs: contracts w/ detail dialog, invoices, performance |
| `/app/compliance` | `Compliance` | district_admin | ✅ **LIVE** — 4 tabs: BEDS/STAC, McKinney-Vento, Ed Law 2-d, audit readiness |
| `/app/settings` | `AppSettings` | district_admin | ✅ **LIVE** — 4 tabs: district info, subscription, users, data & privacy |
| `/app/parent` | `ParentDashboard` | parent | ✅ **LIVE** — welcome, children cards, quick actions |
| `/app/parent/register` | `ParentRegister` | parent | ✅ **LIVE** — in-app registration wizard |
| `/app/parent/reapply` | `ParentReapply` | parent | ✅ **LIVE** — returning-family reapply with grade auto-increment |
| `/app/parent/tracking` | `ParentTracking` | parent | ✅ **LIVE** — coming soon page with animated bus, bus assignments |
| `/app/admin/users` | `UsersAdmin` | district_admin | ✅ **LIVE** — user table, role editing, invite flow |
| `/app/admin/residency` | `AppResidencyAdmin` | district_admin | ✅ **LIVE** — debounced search, approve/deny with audit log |
| `/app/admin/invoices` | `AppInvoicesAdmin` | district_admin | ✅ **LIVE** — stats, filters, bulk approve, CSV export |
| `/app/admin/bids` | `AppBidsAdmin` | district_admin | ✅ **LIVE** — bid CRUD, response scoring, award workflow |

### Sidebar Navigation (AppLayout.tsx)

**Staff sidebar (staffNav):**
1. Dashboard (`/app/dashboard`) — LayoutDashboard
2. Students (`/app/students`) — Users
3. Routes (`/app/routes`) — MapPin
4. Requests (`/app/requests`) — MessageSquare ← **NEW**
5. Communications (`/app/communications`) — Phone ← **NEW**
6. Reports (`/app/reports`) — BarChart3
7. Registrations (`/app/admin/residency`) — ClipboardCheck
8. Contracts (`/app/contracts`) — FileText (district_admin)
9. Compliance (`/app/compliance`) — Shield (district_admin)
10. Settings (`/app/settings`) — Settings (district_admin)

**Parent sidebar (parentNav):**
1. Dashboard (`/app/parent`)
2. My Students (`/app/students`)
3. Register (`/app/parent/register`)
4. Reapply (`/app/parent/reapply`)
5. Track Bus (`/app/parent/tracking`)

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
- **Password reset:** `/forgot-password` → email link → `/reset-password`

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
- **Active item:** White/10 background + primary border-left

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

## 7. Database Schema (34 tables)

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
| `eligibility_rules` | Distance-based eligibility per grade range | District admin + staff read |

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
| `route_aides` | **NEW** — Aide/monitor assignments per route |
| `bus_passes` | **NEW** — Bus pass generation & tracking |

### Service & communication (NEW — Phase 1 & 5)

| Table | Purpose | RLS |
|---|---|---|
| `service_requests` | Central inbox for secretarial tasks | District staff CRUD |
| `service_request_notes` | Threaded responses on requests | District staff CRUD |
| `communication_log` | Phone/email/text/in-person log | District staff CRUD |

### Driver management (NEW — Phase 3)

| Table | Purpose | RLS |
|---|---|---|
| `driver_certifications` | 19A/CDL/medical cert tracking with expiration alerts | District staff CRUD |

### Compliance

| Table | Purpose |
|---|---|
| `compliance_reports` | BEDS/STAC filings |
| `compliance_training` | Staff training tracking |
| `mckinney_vento_students` | Homeless student tracking |
| `ed_law_2d_contractors` | Data privacy agreements |
| `breach_incidents` | Data breach logs |

### Key Enums

**Original:** `ai_priority`, `app_role`, `audit_action`, `bid_status`, `bid_response_status`, `childcare_transport_type`, `contract_status`, `driver_report_type`, `insurance_status`, `invoice_status`, `registration_status`, `report_status`, `safety_report_type`

**New (Phase 1–6):**
- `service_request_type` (stop_change, address_change, school_change, driver_issue, general_inquiry, bus_pass)
- `service_request_status` (open, in_progress, resolved, closed)
- `service_request_priority` (low, normal, high, urgent)
- `certification_type` (19a_initial, 19a_biennial, cdl, medical)
- `certification_status` (valid, expiring, expired)
- `aide_type` (aide, monitor)
- `aide_status` (active, inactive)
- `bus_pass_status` (active, expired, revoked)
- `comm_contact_type` (parent, school, contractor, other_district)
- `comm_direction` (inbound, outbound)
- `comm_channel` (phone, email, text, in_person)

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
- Password reset flow (forgot → email → reset)
- Role-based redirect: parent → /app/parent, staff/admin → /app/dashboard
- Auth-aware navigation (Login/Dashboard button with outlined style)
- New user onboarding flow (`/app/onboarding`)

**App Portal (`/app/*`) — ALL 20 PAGES LIVE:**

- **Dashboard** (`/app/dashboard`) — **Operational Command Center:**
  - **Action Items Banner** — Urgent requests, expired/expiring certifications, expiring contracts, pending registrations, pending invoices (amber left border, clickable pills)
  - **4 stat cards** (Total Students, Active Routes, On-Time Rate, Open Requests) — clickable, with trends
  - **Quick Actions** bar (Add Student, New Request, Log Communication, View Registrations)
  - **4 Workflow Section cards:**
    - **Secretarial:** Open requests, urgent count, pending registrations → links to `/app/requests`
    - **Transportation:** Active routes, daily miles, aides assigned, bus passes → links to `/app/routes`
    - **Business:** Pending invoices, expiring contracts, expiring/expired 19A certs → links to `/app/contracts`
    - **Compliance:** Avg cost/student, avg ride time, communications count → links to `/app/compliance`
  - **Charts:** Students by School bar chart + Route Tiers pie chart
  - **Bottom stats:** Total Daily Miles, Avg Ride Time, Avg Cost/Student, Bus Passes Issued

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

- **Requests** (`/app/requests`) — **NEW Service Request Hub:**
  - Summary cards: Open Requests, Avg Resolution Time, By Type breakdown
  - Filterable table with type (stop_change, address_change, school_change, driver_issue, general_inquiry, bus_pass), priority, status, date
  - Detail dialog with timeline of notes, status update buttons
  - Create new request form

- **Communications** (`/app/communications`) — **NEW Communication Log:**
  - Log calls, emails, texts, in-person meetings
  - Contact types: parent, school, contractor, other_district
  - Direction: inbound/outbound
  - Link to related students or routes
  - Searchable and filterable by contact, type, date
  - New entry form

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

- **Onboarding** (`/app/onboarding`):
  - New user onboarding flow (outside AppLayout for focused experience)

- **Parent Dashboard** (`/app/parent`):
  - Welcome message with parent name
  - Quick action buttons: Register Child, Reapply Next Year, Track Bus, Notifications
  - My Children cards: student name, grade, school, status badge, address, school year

- **Parent Register** (`/app/parent/register`):
  - In-app registration wizard (reuses RegisterWizard pattern)

- **Parent Reapply** (`/app/parent/reapply`):
  - Fetches previous year registrations, auto-increments grade, e-signature

- **Parent Tracking** (`/app/parent/tracking`):
  - "GPS Tracking Launching Soon" with animated bus, bus assignment cards

- **Admin Users** (`/app/admin/users`):
  - Full user table with search, role distribution badges, invite flow

- **Admin Residency** (`/app/admin/residency`):
  - Searchable registration review with debounced search (350ms), approve/deny with audit logging

- **Admin Invoices** (`/app/admin/invoices`):
  - Stats, filters, bulk approve, CSV export

- **Admin Bids** (`/app/admin/bids`):
  - Bid CRUD, status cards, scoring system, award workflow

**Legacy Admin (`/admin/*`):**
- 11 fully functional sub-pages

**Backend:**
- 34 database tables with comprehensive RLS policies
- Multi-tenant isolation via district_id
- Hierarchical role system with SQL helper functions
- File storage bucket for residency documents

### 🔲 Not Yet Built (Future Features)

- Real-time GPS bus tracking (ParentTracking page is a "coming soon" preview)
- Real-time subscriptions (Supabase Realtime)
- Push notification system
- Dark mode (not planned — navy sections provide contrast)
- Parent-submitted service requests (parents can't yet submit from their portal)
- Bulk bus pass generation UI
- Fleet management module (N/A for contracted transport)

---

## 9. Wireframe & UI Patterns

### Dashboard Layout (Operational Command Center)
```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  Lawrence Union Free School District       🔔 👤    │
├──────┬─────────────────────────────────────────────────────┤
│      │ Dashboard                                           │
│ 🏠   │ Lawrence UFSD — Tuesday, February 25, 2026          │
│ 👥   │                                                     │
│ 🗺️   │ ⚠ Action Items Requiring Attention                  │
│ 💬   │ [Urgent Requests: 3] [Expired Certs: 2]            │
│ 📞   │ [Expiring Certs: 4] [Pending Registrations: 697]   │
│ 📊   │                                                     │
│ 📋   │ ┌──────────┐┌──────────┐┌──────────┐┌─────────────┐│
│ 📄   │ │Students  ││Routes    ││On-Time   ││Open Requests││
│ 🛡️   │ │ 8,302    ││538/575   ││93%       ││12           ││
│ ⚙️   │ │ +3.2%    ││99%       ││+1.4%     ││3 urgent     ││
│      │ └──────────┘└──────────┘└──────────┘└─────────────┘│
│      │                                                     │
│      │ Quick Actions                                       │
│      │ [+ Student] [New Request] [Log Comm] [Registrations]│
│      │                                                     │
│      │ ┌─Secretarial─┐┌─Transport──┐┌─Business─┐┌─Comply─┐│
│      │ │Open: 12     ││Routes: 538 ││Invoices:3││$/Stu:  ││
│      │ │Urgent: 3    ││Miles: 7111 ││Exp Certs ││Ride: 30││
│      │ │Pending: 697 ││Aides: 15   ││Contracts ││Comms:8 ││
│      │ └─────────────┘└────────────┘└──────────┘└────────┘│
│      │                                                     │
│      │ ┌──── Students by School ────┐┌─── Tiers ────┐     │
│      │ │ [bar chart]               ││ [donut]       │     │
│      │ └───────────────────────────┘└───────────────┘     │
│      │                                                     │
│      │ ┌─Miles──┐┌─Ride Time─┐┌─Cost/Stu─┐┌─Bus Passes──┐│
│      │ │ 7,111  ││ 30 min    ││ $1,099   ││ 200         ││
│      │ └────────┘└───────────┘└──────────┘└─────────────┘│
└──────┴─────────────────────────────────────────────────────┘
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

### Service Request Flow (NEW)
```
Dashboard Action Items → click "Urgent Requests" → /app/requests
  → Requests page fetches service_requests with filters
  → Create request → insert service_requests row
  → Add note → insert service_request_notes row
  → Change status → update service_requests.status
  → Resolve → sets resolved_at timestamp
```

### Communication Log Flow (NEW)
```
Dashboard Quick Action → "Log Communication" → /app/communications
  → New entry form: contact type, direction, channel, subject, notes
  → Optionally link to student or route
  → Insert communication_log row
  → Search/filter existing logs
```

### Dashboard Data Flow (NEW — Operational Command Center)
```
Dashboard mounts → 10 parallel Supabase queries:
  1. routes (school, status, metrics, tier)
  2. student_registrations (approved count)
  3. student_registrations (pending count)
  4. service_requests (status, priority)
  5. driver_certifications (status)
  6. bus_passes (active count)
  7. route_aides (active count)
  8. communication_log (total count)
  9. contract_invoices (pending count)
  10. contracts (active, expiring in 90 days)
→ Aggregates into stat cards, action items, workflow sections
→ Action items banner: urgent requests + expired certs + expiring certs + expiring contracts + pending registrations + pending invoices
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
14. **Dashboard as Command Center** — 10 parallel queries aggregate data from all workflow areas into a single operational view
15. **Workflow automation** — Service requests cover all secretarial tasks (stop changes, address changes, school changes, driver issues, general inquiries, bus pass requests)

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
- **Service Requests:** 12 seeded (3 urgent, various types)
- **Driver Certifications:** 19 seeded (including expiring/expired alerts)
- **Bus Passes:** 200 active
- **Route Aides:** 15 assigned
- **Communication Log:** 8 entries
- **Users:** 1 district admin (A. Blumstein)

---

## 13. Conversion Strategy

- **Primary CTA:** "Get Free Audit" / "Start Your Free Route Audit"
- **No explicit pricing** — personalized assessments highlighting potential savings
- **ROI messaging:** Based on generalized district parameters (5,000 students, 45 routes)
- **Projected savings:** $710K–$1.6M in Year 1
- Districts are NOT self-serve — onboarded by RideLine's sales team

---

*End of external blueprint. Updated 2026-02-25 (Phase 1–6 workflow automation complete).*
