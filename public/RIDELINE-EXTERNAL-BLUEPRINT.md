# RideLine — Full Project Blueprint for External AI Assistants

> **Last updated:** 2026-02-25 (Demo-Ready Build — all 6 tasks complete)
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
- Cross-district regional benchmarking
- Parent self-service request submission
- CSV export on all data tables

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
│   │   │   ├── AppLayout.tsx       # Sidebar + top bar + badge counts
│   │   │   ├── AppBreadcrumb.tsx
│   │   │   ├── ProtectedRoute.tsx  # Auth gate → /login
│   │   │   ├── RoleGate.tsx        # Role-based access gate
│   │   │   ├── EmptyState.tsx      # Reusable empty-table component
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
│   ├── lib/
│   │   ├── utils.ts
│   │   └── csvExport.ts        # Client-side CSV generation utility
│   ├── pages/
│   │   ├── Index.tsx           # Homepage (22 lazy-loaded sections)
│   │   ├── Login.tsx           # Email + Google + Apple sign-in
│   │   ├── 17 more public pages (Blog, Demo, About, Contact, etc.)
│   │   ├── admin/              # 11 legacy admin pages
│   │   └── app/                # Authenticated portal pages
│   │       ├── Dashboard.tsx   # ✅ Operational Command Center + benchmarks
│   │       ├── Students.tsx    # ✅ CRUD + CSV export
│   │       ├── AppRoutes.tsx   # ✅ Routes + Bus Passes tabs
│   │       ├── Contracts.tsx   # ✅ 3 tabs + Regional Benchmark card
│   │       ├── Compliance.tsx  # ✅ 4 tabs (BEDS/STAC, MV, Ed Law, Audit)
│   │       ├── Reports.tsx     # ✅ 4 tabs (safety, driver, alerts, analytics)
│   │       ├── Requests.tsx    # ✅ Service Request Hub + CSV export
│   │       ├── Communications.tsx # ✅ Communication Log + CSV export
│   │       ├── Settings.tsx    # ✅ 4 tabs (district, subscription, users, privacy)
│   │       ├── Onboarding.tsx  # ✅ New user onboarding flow
│   │       ├── parent/
│   │       │   ├── ParentDashboard.tsx  # ✅ + Service request submission + My Requests
│   │       │   ├── ParentRegister.tsx   # ✅
│   │       │   ├── ParentReapply.tsx    # ✅
│   │       │   └── ParentTracking.tsx   # ✅ Coming soon preview
│   │       └── admin/
│   │           ├── AppResidencyAdmin.tsx # ✅ Residency review
│   │           ├── UsersAdmin.tsx        # ✅ User/role management
│   │           ├── AppInvoicesAdmin.tsx   # ✅ Invoice verification + CSV
│   │           └── AppBidsAdmin.tsx       # ✅ Bid management + scoring
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
| `/app/onboarding` | `Onboarding` | any | ✅ Outside AppLayout |
| `/app/dashboard` | `Dashboard` | any | ✅ Operational Command Center |
| `/app/students` | `Students` | any | ✅ CRUD + CSV export |
| `/app/routes` | `AppRoutes` | any | ✅ Routes tab + Bus Passes tab |
| `/app/requests` | `Requests` | staff+ | ✅ Service Request Hub + CSV |
| `/app/communications` | `Communications` | staff+ | ✅ Communication Log + CSV |
| `/app/reports` | `Reports` | any | ✅ 4 tabs |
| `/app/contracts` | `Contracts` | district_admin | ✅ 3 tabs + Regional Benchmark |
| `/app/compliance` | `Compliance` | district_admin | ✅ 4 tabs |
| `/app/settings` | `AppSettings` | district_admin | ✅ 4 tabs |
| `/app/parent` | `ParentDashboard` | parent | ✅ + Request submission + My Requests |
| `/app/parent/register` | `ParentRegister` | parent | ✅ |
| `/app/parent/reapply` | `ParentReapply` | parent | ✅ |
| `/app/parent/tracking` | `ParentTracking` | parent | ✅ Coming soon |
| `/app/admin/users` | `UsersAdmin` | district_admin | ✅ |
| `/app/admin/residency` | `AppResidencyAdmin` | district_admin | ✅ |
| `/app/admin/invoices` | `AppInvoicesAdmin` | district_admin | ✅ |
| `/app/admin/bids` | `AppBidsAdmin` | district_admin | ✅ |

### Sidebar Navigation (AppLayout.tsx)

**Staff sidebar (staffNav) — with badge counts:**
1. Dashboard (`/app/dashboard`) — LayoutDashboard
2. Students (`/app/students`) — Users
3. Routes (`/app/routes`) — MapPin
4. Requests (`/app/requests`) — MessageSquare — 🔴 badge: open request count
5. Communications (`/app/communications`) — Phone
6. Reports (`/app/reports`) — BarChart3
7. Registrations (`/app/admin/residency`) — ClipboardCheck — 🔴 badge: pending count
8. Contracts (`/app/contracts`) — FileText (district_admin) — 🔴 badge: expiring count
9. Compliance (`/app/compliance`) — Shield (district_admin)
10. Settings (`/app/settings`) — Settings (district_admin)

**Parent sidebar (parentNav):**
1. Dashboard (`/app/parent`)
2. My Students (`/app/students`)
3. Register (`/app/parent/register`)
4. Reapply (`/app/parent/reapply`)
5. Track Bus (`/app/parent/tracking`)

**Badge counts:** Fetched on mount + refreshed every 5 minutes (open requests, pending registrations, expiring contracts).

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
- `get_regional_benchmarks()` — returns anonymized cross-district averages

### React Context Architecture
```
<AuthProvider>                  ← wraps entire app
  <BrowserRouter>
    <ProtectedRoute>            ← checks session, redirects to /login
      <DistrictProvider>        ← fetches profile + district + role
        <AppLayout>             ← sidebar + top bar + badge counts
          <RoleGate>            ← optional per-route role check
            <Page />
```

**`useDistrict()` provides:** `district`, `profile`, `role`, `isAdmin`, `isStaff`, `isParent`, `isSuperAdmin`, `isTransportDirector`

### App Shell (AppLayout)
- **Sidebar:** Navy (#151D33), collapsible, role-filtered nav items, badge counts on Requests/Registrations/Contracts
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

## 7. Database Schema (34+ tables)

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
| `student_registrations` | Parent registration data (14,000+ records across 2 districts) | Parent-owned + district staff |
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
| `contract_invoices` | Invoice verification |
| `contractor_performance` | Performance scorecards (6-month story arcs) |
| `bids` | Bid/RFP solicitations |
| `bid_responses` | Contractor bid responses |

### Routes & operations

| Table | Purpose |
|---|---|
| `routes` | Route data & metrics (660+ routes across 2 districts) |
| `route_stops` | Stop-level data with geocoding (6,500+) |
| `route_scenarios` | Consolidation simulation scenarios |
| `route_aides` | Aide/monitor assignments per route |
| `bus_passes` | Bus pass generation & tracking |

### Service & communication

| Table | Purpose | RLS |
|---|---|---|
| `service_requests` | Central inbox for secretarial tasks | District staff CRUD + parent self-service |
| `service_request_notes` | Threaded responses on requests | District staff CRUD + parent read |
| `communication_log` | Phone/email/text/in-person log | District staff CRUD |

### Driver management

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

**Added:**
- `service_request_type` (stop_change, address_change, school_change, driver_issue, general_inquiry, bus_pass)
- `service_request_status` (open, in_progress, resolved, closed)
- `service_request_priority` (low, medium, high, urgent)
- `certification_type` (19a_initial, 19a_biennial, cdl, medical)
- `certification_status` (valid, expiring, expired)
- `aide_type` (aide, monitor)
- `aide_status` (active, inactive)
- `bus_pass_status` (active, expired, revoked)
- `comm_contact_type` (parent, school, contractor, other_district)
- `comm_direction` (inbound, outbound)
- `comm_channel` (phone, email, text, in_person)

### RPC Functions

| Function | Purpose |
|---|---|
| `get_regional_benchmarks()` | SECURITY DEFINER — returns anonymized cross-district averages (avg_rate_per_route, avg_on_time_pct, avg_utilization, district_count, route_count) |

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

## 8. Current Build State — Demo-Ready

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
- Auth-aware navigation (Login/Dashboard button)
- New user onboarding flow (`/app/onboarding`)

**App Portal (`/app/*`) — ALL 20 PAGES LIVE:**

- **Dashboard** (`/app/dashboard`) — **Operational Command Center:**
  - **Action Items Banner** — Urgent requests, expired/expiring certifications, expiring contracts, pending registrations, pending invoices
  - **4 stat cards** (Total Students, Active Routes, On-Time Rate, Open Requests) — clickable
  - **Quick Actions** bar (Add Student, New Request, Log Communication, View Registrations)
  - **4 Workflow Section cards:** Secretarial, Transportation, Business (with regional benchmark line), Compliance
  - **Charts:** Students by School bar chart + Route Tiers pie chart
  - **Bottom stats:** Total Daily Miles, Avg Ride Time, Avg Cost/Student, Bus Passes Issued

- **Students** (`/app/students`):
  - Paginated table (50/page), debounced search, status/school/type filters
  - Detail dialog with edit mode for IEP/504/MV/FC flags
  - Add Student form, Add Childcare Pickup Request
  - **CSV export**

- **Routes & Bus Passes** (`/app/routes`) — **2 tabs:**
  - **Routes tab:** Stats bar, 3 inefficiency cards (Ghost Routes, Long Rides, Low Efficiency), sortable table with efficiency grades (A-F), consolidation simulator, **CSV export**
  - **Bus Passes tab:** Generate passes dialog (scope: all/by school, preview count), passes table with search/filter, revoke action, stats cards, **CSV export** *(district_admin only for generation)*

- **Requests** (`/app/requests`) — **Service Request Hub:**
  - Summary cards, filterable table (6 types, 4 priorities, 4 statuses)
  - Detail dialog with timeline of notes, status update buttons
  - Create new request form
  - **CSV export**

- **Communications** (`/app/communications`) — **Communication Log:**
  - Log calls, emails, texts, in-person meetings
  - Direction: inbound/outbound, contact types, link to student/route
  - **CSV export**

- **Contracts** (`/app/contracts`) — **3 tabs + Regional Benchmark:**
  - **Regional Benchmark card:** Your district vs regional average for rate/route, on-time %, utilization — green/red indicators
  - **Contracts tab:** Table with insurance/performance badges, detail dialog
  - **Invoices tab:** Approve/dispute workflow, monthly bar chart
  - **Performance tab:** Contractor leaderboard with trend chart

- **Compliance** (`/app/compliance`) — 4 tabs: BEDS/STAC, McKinney-Vento, Ed Law §2-d, Audit Readiness

- **Reports** (`/app/reports`) — 4 tabs: Safety, Driver, Alerts, Analytics

- **Settings** (`/app/settings`) — 4 tabs: District Info, Subscription, Users, Data & Privacy

- **Parent Dashboard** (`/app/parent`):
  - Welcome message, My Children cards
  - **Submit a Request** — dialog with type dropdown (stop_change, address_change, bus_pass, general_inquiry), subject, description, student selector
  - **My Requests** section — shows submitted requests with status badges, click to see detail with staff notes

- **Parent Register/Reapply/Tracking** — all functional

- **Admin Pages** — Users, Residency, Invoices, Bids — all functional

**Backend:**
- 34+ database tables with comprehensive RLS policies
- Multi-tenant isolation via district_id
- Parent self-service RLS policies on service_requests and service_request_notes
- Regional benchmarking RPC function
- File storage bucket for residency documents

### Live District Data

**District 1: Lawrence UFSD (~68% audit readiness)**
- Students: 8,302 registered (9,000+ total registrations)
- Routes: 575 (538 active), 7 schools, 3 tiers
- Contractors: 4 (Atlantic Express, Logan Bus, Varsity Transit, Baumann & Sons)
- Logan Bus: declining performance arc over 6 months, non-compliant Ed Law 2-d, >$10K invoice discrepancies
- 12+ McKinney-Vento students, 19+ driver certifications (2 expired, 4+ expiring)
- 12+ service requests (3 urgent), 8+ communication logs
- 200+ bus passes, 15+ route aides

**District 2: Oceanside UFSD (~48% audit readiness)**
- Students: 5,179 across 10 schools
- Routes: 85 (OC-001 to OC-085), 850 route stops
- Contractors: 3 (Nassau Student Transport, South Shore Bus Co., Island Transit Services)
- South Shore: insurance expiring within 30 days, non-compliant Ed Law 2-d, 1 breach incident
- 6 McKinney-Vento students, 25 driver certifications (3 expiring, 2 expired)
- 150 bus passes, 12 route aides
- 15 service requests, 10 communication logs, 12 invoices

### 🔲 Not Yet Built (Future Features)

- Real-time GPS bus tracking (ParentTracking page is a "coming soon" preview)
- Real-time subscriptions (Supabase Realtime)
- Push notification system
- Dark mode (not planned — navy sections provide contrast)
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
│ 💬🔴 │ [Urgent Requests: 3] [Expired Certs: 2]            │
│ 📞   │ [Expiring Certs: 4] [Pending Registrations: 697]   │
│ 📊   │                                                     │
│ 📋🔴 │ ┌──────────┐┌──────────┐┌──────────┐┌─────────────┐│
│ 📄🔴 │ │Students  ││Routes    ││On-Time   ││Open Requests││
│ 🛡️   │ │ 8,302    ││538/575   ││93%       ││12           ││
│ ⚙️   │ │ +3.2%    ││99%       ││+1.4%     ││3 urgent     ││
│      │ └──────────┘└──────────┘└──────────┘└─────────────┘│
│      │                                                     │
│      │ Quick Actions                                       │
│      │ [+ Student] [New Request] [Log Comm] [Registrations]│
│      │                                                     │
│      │ ┌─Secretarial─┐┌─Transport──┐┌─Business───┐┌Comply┐│
│      │ │Open: 12     ││Routes: 538 ││Invoices:3  ││$/Stu ││
│      │ │Urgent: 3    ││Miles: 7111 ││Exp Certs   ││Ride  ││
│      │ │Pending: 697 ││Aides: 15   ││Contracts   ││Comms ││
│      │ │             ││Passes: 200 ││RegAvg:$XXK ││      ││
│      │ └─────────────┘└────────────┘└────────────┘└──────┘│
│      │                                                     │
│      │ ┌──── Students by School ────┐┌─── Tiers ────┐     │
│      │ │ [bar chart]               ││ [donut]       │     │
│      │ └───────────────────────────┘└───────────────┘     │
└──────┴─────────────────────────────────────────────────────┘
```

### Routes & Bus Passes Layout
```
┌──────┬──────────────────────────────────────────────┐
│      │ Routes & Bus Passes                          │
│      │ [Routes] [🎫 Bus Passes (150)]      [CSV ↓] │
│      │                                              │
│      │ ┌─Total─┐┌─Active─┐┌─Util─┐┌─Miles─┐┌Dur──┐│
│      │ │ 85    ││ 80     ││ 74%  ││ 1,200 ││25m  ││
│      │ └───────┘└────────┘└──────┘└───────┘└─────┘│
│      │                                              │
│      │ ┌Ghost─┐┌Long Rides─┐┌Low Efficiency──┐     │
│      │ │5 rts ││ 3 routes  ││ 8 routes       │     │
│      │ └──────┘└───────────┘└────────────────┘     │
│      │                                              │
│      │ Route  School   Bus   Students  Util  Grade  │
│      │ OC-001 Elem #1  B-101 45/72    62%   B     │
│      │ ...                                          │
└──────┴──────────────────────────────────────────────┘
```

### Parent Dashboard with Requests
```
┌──────┬──────────────────────────────────────────────┐
│      │ Welcome back, Parent Name                    │
│      │                                              │
│      │ [Register] [Reapply] [Track Bus] [📨 Request]│
│      │                                              │
│      │ My Children                                  │
│      │ ┌────────────────────┐┌───────────────────┐  │
│      │ │ Sophia G5 · Elem  ││ Liam K · Middle   │  │
│      │ │ Approved           ││ Pending           │  │
│      │ └────────────────────┘└───────────────────┘  │
│      │                                              │
│      │ My Requests                                  │
│      │ ┌────────────────────────────────────────────┐│
│      │ │ Stop Change · Bus stop relocation  · Open ││
│      │ │ Address Chg · Moved to new address · Done ││
│      │ └────────────────────────────────────────────┘│
└──────┴──────────────────────────────────────────────┘
```

---

## 10. Data Flow Patterns

### Dashboard Data Flow
```
Dashboard mounts → 10+ parallel Supabase queries:
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
  11. get_regional_benchmarks() RPC
→ Aggregates into stat cards, action items, workflow sections, benchmark line
```

### Bus Pass Generation Flow
```
Routes page → Bus Passes tab → "Generate Passes" (admin only)
  → Select scope (all approved / by school) + school year
  → Preview: queries student_registrations(approved) minus existing active passes
  → Generate: bulk insert bus_passes in batches of 100
  → Pass number format: BP-YYYY-NNNNN
  → Table: search, filter by school/status, revoke action, CSV export
```

### Parent Request Submission Flow
```
Parent Dashboard → "Submit a Request" button
  → Dialog: type (stop_change/address_change/bus_pass/general_inquiry)
  → Select child from dropdown, enter subject + description
  → INSERT service_requests with parent_user_id = auth.uid()
  → My Requests section shows all parent's requests
  → Click request → see detail + staff notes (read-only)
```

### Regional Benchmarking Flow
```
Contracts page mounts → supabase.rpc("get_regional_benchmarks")
  → Returns: avg_rate_per_route, avg_on_time_pct, avg_utilization, district_count, route_count
  → Benchmark card: your rate vs regional, with green/red % diff indicators
Dashboard Business card → shows regional avg rate line
```

### CSV Export Pattern
```
Any table page → "Export CSV" button
  → exportToCsv(filename, data, columns) from @/lib/csvExport
  → Client-side Blob generation → automatic download
  → Available on: Students, Routes, Bus Passes, Requests, Communications
```

### Auth Flow
```
/login → email/password or OAuth → Supabase Auth session
  → AuthContext.onAuthStateChange sets session
  → Navigate to /app/dashboard (or /app/parent for parents)
  → ProtectedRoute checks session → DistrictProvider fetches profile
  → AppLayout renders sidebar filtered by role with badge counts
  → RoleGate blocks unauthorized routes
```

### RLS Data Access
```
User logs in → auth.uid() available
  → get_user_district_id() returns district_id from profiles
  → Every query filtered: WHERE district_id = get_user_district_id()
  → has_app_role() checks hierarchical permissions
  → Parents: own registrations (parent_user_id = auth.uid())
  → Parents: own service requests (parent_user_id = auth.uid())
  → Staff+: can see all district data
```

---

## 11. Key Technical Decisions

1. **No dark mode** — Navy sections provide sufficient contrast
2. **No self-serve signup** — Districts onboarded by sales team
3. **Dual admin systems** — Legacy `/admin/*` uses `has_role()` + `user_roles`; new `/app/*` uses `has_app_role()` + `district_user_roles`
4. **Client-side blog** — 66 posts stored in TypeScript files, no CMS
5. **All homepage cards clickable** — Navigate to /demo or open audit modal
6. **Childcare filter is server-side** — First fetches registration IDs, then uses `.in()` for filtering
7. **Debounced search** — 350ms delay on search inputs to reduce API calls
8. **HSL design tokens** — All colors defined as HSL in index.css, referenced via Tailwind semantic classes
9. **Supabase types are auto-generated** — Never edit `src/integrations/supabase/types.ts`
10. **Edge functions auto-deploy** — No manual deployment needed
11. **Direct Supabase queries** — Pages use `useCallback` + `useEffect` pattern (not React Query hooks) for data fetching
12. **Currency formatting** — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
13. **Pagination** — 50 records per page with offset-based pagination
14. **Dashboard as Command Center** — 10+ parallel queries aggregate into single operational view
15. **CSV export** — Client-side Blob generation via `src/lib/csvExport.ts`
16. **Empty states** — Reusable `EmptyState` component with icon, message, and CTA
17. **Sidebar badges** — Real-time counts refreshed every 5 minutes
18. **Regional benchmarking** — Cross-district anonymized via SECURITY DEFINER RPC
19. **Bus pass generation** — Batch insert (100/batch) with duplicate prevention
20. **Parent self-service** — Parents can submit and track service requests via ParentDashboard

---

## 12. What an External AI Should Know

### DO:
- Use Tailwind semantic tokens (`text-foreground`, `bg-primary`, etc.) — never hardcode colors
- Follow existing component patterns (shadcn/ui Card, Dialog, Table, Button, Badge, Tabs, etc.)
- Use `supabase` client from `@/integrations/supabase/client`
- Use `useDistrict()` for district/profile/role context
- Use `useAuth()` for session/user
- Include `district_id` from `useDistrict().district.id` in all INSERT calls
- Add RLS policies for any new tables
- Use the existing design system fonts (Playfair Display headings, DM Sans body)
- Use sonner toast notifications for success/error feedback
- Use Recharts for any charts
- Use `exportToCsv()` from `@/lib/csvExport` for any data export
- Use `EmptyState` component from `@/components/app/EmptyState` for empty tables

### DON'T:
- Edit `src/integrations/supabase/client.ts` or `types.ts` (auto-generated)
- Edit `package.json` directly (use package manager tools)
- Edit `.env` or `supabase/config.toml` (auto-managed)
- Use raw colors in components — always use design tokens
- Create tables without district_id (breaks multi-tenancy)
- Manually filter by district_id in SELECT queries (RLS handles it)
- Replace the existing auth, routing, or app shell architecture

---

## 13. Conversion Strategy

- **Primary CTA:** "Get Free Audit" / "Start Your Free Route Audit"
- **No explicit pricing** — personalized assessments highlighting potential savings
- **ROI messaging:** Based on generalized district parameters (5,000 students, 45 routes)
- **Projected savings:** $710K–$1.6M in Year 1
- Districts are NOT self-serve — onboarded by RideLine's sales team

---

*End of external blueprint. Updated 2026-02-25 (Demo-Ready Build — all 6 tasks complete).*
