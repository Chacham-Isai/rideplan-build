# RideLine — Complete Project Blueprint (A–Z)

> **Last updated:** 2026-02-24
> **Purpose:** Hand this file to any AI assistant (Claude, GPT, etc.) so it can fully understand the project's architecture, tech stack, page flow, component tree, database schema, auth system, and design system in one read.

---

## 1. What Is RideLine?

RideLine is a **B2B SaaS platform** for K–12 school-district transportation management. It replaces spreadsheets, phone calls, and guesswork with a single command center. The project consists of:

1. **Public marketing website** — high-conversion landing page + sub-pages (blog, demo, about, etc.)
2. **Authenticated app** (`/app/*`) — multi-tenant district dashboard with role-based access
3. **Legacy admin** (`/admin/*`) — original admin panel (still functional, separate auth)

**Key value propositions:**
- Route optimization → saves districts $710K–$1.6M in Year 1
- Real-time GPS tracking for parents
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
| **Build** | Vite 5 (with SWC plugin) |
| **Styling** | Tailwind CSS 3 + CSS custom properties (HSL tokens) |
| **UI Kit** | shadcn/ui (Radix primitives) |
| **Animation** | Framer Motion 12 |
| **Routing** | React Router DOM 6 |
| **State / Data** | TanStack React Query 5 |
| **Forms** | React Hook Form + Zod validation |
| **SEO** | react-helmet-async |
| **Charts** | Recharts |
| **Backend** | Lovable Cloud (Supabase) |
| **Auth** | Supabase Auth + Lovable Cloud OAuth (Google, Apple) |
| **Edge Functions** | Deno (Supabase Edge Functions) |
| **Markdown** | react-markdown (blog content) |
| **OAuth** | @lovable.dev/cloud-auth-js (managed Google & Apple sign-in) |

---

## 3. Project Structure

```
├── public/
│   ├── favicon.ico
│   ├── og-default.png
│   ├── robots.txt              # Disallows /admin/* and /app/*
│   └── sitemap.xml
├── scripts/
│   └── generate-sitemap.ts
├── src/
│   ├── assets/                 # Static images (imported as ES6 modules)
│   ├── components/
│   │   ├── sections/           # 22 landing-page section components
│   │   │   ├── Navigation.tsx  # Public site nav with auth-aware Login/Dashboard link
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PlatformSection.tsx   # Clickable module cards → /demo
│   │   │   ├── ProblemSection.tsx    # Clickable problem cards → /demo
│   │   │   ├── QuestionsSection.tsx  # Clickable question cards → /demo
│   │   │   ├── HowItWorks.tsx       # Clickable step cards → /demo
│   │   │   ├── WhoWeServeSection.tsx # Clickable persona cards → /demo
│   │   │   ├── PricingSection.tsx    # Clickable audit cards → opens audit modal
│   │   │   ├── FeatureDeepDives.tsx  # 4 features with animated illustrations
│   │   │   ├── Footer.tsx
│   │   │   └── ... (13 more sections)
│   │   ├── app/                # Authenticated app shell components
│   │   │   ├── AppLayout.tsx       # Sidebar + top bar layout for /app/*
│   │   │   ├── AppBreadcrumb.tsx   # Breadcrumb navigation
│   │   │   ├── PlaceholderPage.tsx  # Reusable "Coming Soon" placeholder
│   │   │   ├── ProtectedRoute.tsx  # Auth gate → redirect to /login if no session
│   │   │   └── RoleGate.tsx        # Role-based access gate
│   │   ├── admin/              # Legacy AdminLayout with sidebar navigation
│   │   ├── registration/       # RegisterWizard + 6 step components
│   │   ├── ui/                 # 50+ shadcn/ui primitives
│   │   ├── AnimatedRouteMap.tsx    # SVG animated bus route map (Route Optimization)
│   │   ├── AnimatedStat.tsx
│   │   ├── BackToTop.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── ContactFormModal.tsx
│   │   ├── DashboardAnimated.tsx   # Animated student assignment overlay
│   │   ├── NavLink.tsx
│   │   ├── ParentAppAnimated.tsx   # Animated notification alerts overlay
│   │   ├── ScrollReveal.tsx
│   │   └── SEOHead.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Supabase auth session provider
│   │   └── DistrictContext.tsx # District + profile + role provider
│   ├── data/
│   │   ├── blogPosts.ts
│   │   └── additionalBlogPosts.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useCountUp.ts
│   │   └── useScrollReveal.ts
│   ├── integrations/
│   │   ├── lovable/index.ts   # Managed OAuth (Google, Apple) — auto-generated
│   │   └── supabase/
│   │       ├── client.ts      # Auto-generated
│   │       └── types.ts       # Auto-generated
│   ├── lib/utils.ts
│   ├── pages/
│   │   ├── Index.tsx          # Homepage (22 lazy-loaded sections)
│   │   ├── Login.tsx          # Email/password + Google + Apple sign-in
│   │   ├── Signup.tsx         # "Contact us for a demo" redirect page
│   │   ├── About.tsx
│   │   ├── Blog.tsx / BlogPost.tsx
│   │   ├── Careers.tsx
│   │   ├── Contact.tsx
│   │   ├── Demo.tsx
│   │   ├── DriverPortal.tsx
│   │   ├── NotFound.tsx
│   │   ├── Press.tsx
│   │   ├── Privacy.tsx / Terms.tsx
│   │   ├── Register.tsx       # Public parent registration (6-step wizard)
│   │   ├── Reapply.tsx        # Returning-family flow
│   │   ├── Resources.tsx
│   │   ├── SafetyReport.tsx
│   │   ├── TipDriver.tsx
│   │   ├── AdminLogin.tsx     # Legacy admin login
│   │   ├── admin/             # 11 legacy admin sub-pages
│   │   └── app/               # Authenticated app pages (placeholder stage)
│   │       ├── Dashboard.tsx
│   │       ├── Students.tsx
│   │       ├── AppRoutes.tsx
│   │       ├── Contracts.tsx
│   │       ├── Compliance.tsx
│   │       ├── Reports.tsx
│   │       ├── Settings.tsx
│   │       ├── parent/
│   │       │   ├── ParentDashboard.tsx
│   │       │   ├── ParentRegister.tsx
│   │       │   ├── ParentReapply.tsx
│   │       │   └── ParentTracking.tsx
│   │       └── admin/
│   │           ├── UsersAdmin.tsx
│   │           ├── AppResidencyAdmin.tsx
│   │           ├── AppInvoicesAdmin.tsx
│   │           └── AppBidsAdmin.tsx
│   ├── App.tsx                # All routing — public, auth, app, legacy admin
│   ├── index.css              # Design system tokens
│   └── main.tsx
├── supabase/
│   ├── config.toml
│   ├── migrations/            # SQL migrations (auto-managed)
│   └── functions/
│       ├── chat/index.ts
│       └── analyze-reports/index.ts
├── index.html
├── tailwind.config.ts
└── vite.config.ts
```

---

## 4. Routing Map

### Public Routes (no auth required)

| Path | Component | Description |
|---|---|---|
| `/` | `Index` | Homepage (22 lazy-loaded sections) |
| `/contact` | `Contact` | Contact page |
| `/blog` | `Blog` | Blog listing (66 posts) |
| `/blog/:slug` | `BlogPost` | Individual blog article |
| `/demo` | `Demo` | Interactive product demo tour |
| `/resources` | `Resources` | Resource center |
| `/about` | `About` | About page |
| `/press` | `Press` | Press kit |
| `/careers` | `Careers` | Careers page |
| `/privacy` | `Privacy` | Privacy policy |
| `/terms` | `Terms` | Terms of service |
| `/report` | `SafetyReport` | Public safety report form |
| `/driver-portal` | `DriverPortal` | Driver-facing portal |
| `/tip-driver` | `TipDriver` | Driver tipping page |
| `/register` | `Register` | Parent registration (6-step wizard) |
| `/reapply` | `Reapply` | Returning-family re-registration |
| `/login` | `Login` | Login (email/password + Google + Apple OAuth) |
| `/signup` | `Signup` | Redirect to demo request |
| `*` | `NotFound` | 404 page |

### Authenticated App Routes (`/app/*` — requires Supabase Auth session)

All wrapped in `ProtectedRoute` → `DistrictProvider` → `AppLayout`.

| Path | Component | Role Required | Status |
|---|---|---|---|
| `/app` | → redirect `/app/dashboard` | any | ✅ |
| `/app/dashboard` | `Dashboard` | any | placeholder |
| `/app/students` | `Students` | any | placeholder |
| `/app/routes` | `AppRoutes` | any | placeholder |
| `/app/reports` | `Reports` | any | placeholder |
| `/app/contracts` | `Contracts` | district_admin | placeholder |
| `/app/compliance` | `Compliance` | district_admin | placeholder |
| `/app/settings` | `Settings` | district_admin | placeholder |
| `/app/parent` | `ParentDashboard` | parent | placeholder |
| `/app/parent/register` | `ParentRegister` | parent | placeholder |
| `/app/parent/reapply` | `ParentReapply` | parent | placeholder |
| `/app/parent/tracking` | `ParentTracking` | parent | placeholder |
| `/app/admin/users` | `UsersAdmin` | district_admin | placeholder |
| `/app/admin/residency` | `AppResidencyAdmin` | district_admin | placeholder |
| `/app/admin/invoices` | `AppInvoicesAdmin` | district_admin | placeholder |
| `/app/admin/bids` | `AppBidsAdmin` | district_admin | placeholder |

### Legacy Admin Routes (`/admin/*` — separate auth system)

| Path | Component | Description |
|---|---|---|
| `/admin/login` | `AdminLogin` | Legacy admin authentication |
| `/admin` | `SafetyReportsAdmin` | Safety reports dashboard |
| `/admin/driver-reports` | `DriverReportsAdmin` | Driver reports |
| `/admin/residency` | `ResidencyAdmin` | Residency audit dashboard |
| `/admin/tips` | `TipsAdmin` | Tips management |
| `/admin/alerts` | `AlertsAdmin` | Alert management |
| `/admin/analytics` | `AnalyticsAdmin` | Analytics dashboard |
| `/admin/contracts` | `ContractsAdmin` | Contract management |
| `/admin/invoices` | `InvoicesAdmin` | Invoice verification |
| `/admin/bids` | `BidsAdmin` | Bid solicitation & scoring |
| `/admin/routes` | `RoutesAdmin` | Route analysis & optimization |
| `/admin/compliance` | `ComplianceAdmin` | Compliance center (4 tabs) |

---

## 5. Authentication & Multi-Tenancy Architecture

### Auth System

- **Provider:** Supabase Auth via Lovable Cloud
- **Methods:** Email/password, Google OAuth, Apple OAuth
- **OAuth library:** `@lovable.dev/cloud-auth-js` (managed, no API keys needed)
- **Context:** `AuthContext` wraps entire app, provides `session`, `user`, `loading`, `signOut`

### Multi-Tenancy (District Isolation)

Every logged-in user belongs to exactly ONE district. Every data table includes `district_id`. Row Level Security (RLS) ensures complete data isolation between districts.

**Core tables:**
- `districts` — tenant table (name, state, BEDS code, subscription tier/status)
- `profiles` — extends `auth.users` (district_id, full_name, email, phone, title)
- `district_user_roles` — maps user_id → district_id → role

**SQL helper functions (all `SECURITY DEFINER STABLE`):**
- `get_user_district_id()` — returns caller's district_id from profiles
- `get_user_role()` — returns caller's role from district_user_roles
- `has_app_role(required_role TEXT)` — hierarchical role check

**Role hierarchy:**
`super_admin` > `district_admin` > `transport_director` > `staff` > `parent` > `viewer`

**RLS policy pattern (applied to all district-scoped tables):**
```sql
CREATE POLICY "district_isolation" ON [table]
  FOR SELECT USING (district_id = get_user_district_id());
```

### React Context Architecture

```
<AuthProvider>                  ← wraps entire app
  <BrowserRouter>
    <ProtectedRoute>            ← checks auth session, redirects to /login
      <DistrictProvider>        ← fetches profile + district, provides useDistrict()
        <AppLayout>             ← sidebar + top bar
          <RoleGate>            ← optional per-route role check
            <Page />
          </RoleGate>
        </AppLayout>
      </DistrictProvider>
    </ProtectedRoute>
  </BrowserRouter>
</AuthProvider>
```

**`useDistrict()` hook provides:**
- `district` object (id, name, state, subscription_tier)
- `profile` object (id, full_name, email, role)
- Convenience booleans: `isAdmin`, `isStaff`, `isParent`, `isSuperAdmin`, `isTransportDirector`

### App Shell (`AppLayout`)

- **Sidebar:** Navy (#151D33), collapsible, role-filtered navigation
- **Top bar:** District name, notification bell, user avatar dropdown
- **Content area:** Off-white (#F7F8FA) background with breadcrumbs
- **Active item:** Gold left border + lighter navy background

---

## 6. Homepage Section Flow

Lazy-loaded with `React.lazy()` and `ScrollReveal` wrappers:

```
 1. AnnouncementBar          — top sticky bar
 2. Navigation               — sticky nav with scroll-spy + auth-aware Login/Dashboard link
 3. HeroSection              — "Every Student. Every Day." + stats + CTAs
 4. TrustBar                 — partner/client logos
 5. LiveStatsDashboard       — real-time animated metrics
 6. PlatformSection          — 6 clickable module cards → /demo
 7. ROISection               — ROI breakdown ($710K–$1.6M)
 8. TestimonialsSection      — customer quotes
 9. ComparisonTable          — Before vs. After RideLine
10. FeatureDeepDives         — 4 detailed features with animated illustrations
11. WhoWeServeSection        — 4 clickable persona cards → /demo
12. SafetyDriverSection      — safety & driver features
13. ROICalculator            — interactive savings calculator
14. ProblemSection           — 6 clickable pain-point cards → /demo
15. QuestionsSection         — 6 clickable data-gap cards → /demo
16. HowItWorks              — 3 clickable step cards → /demo
17. TestimonialBanner        — social proof banner
18. PricingSection           — free audit CTA with 4 clickable benefit cards
19. CoverageMapSection       — service area map
20. CTASection               — final call-to-action
21. Footer                   — site footer
```

### Interactive Card Behavior

All card-style sections are clickable with:
- `cursor-pointer` + `hover:-translate-y-1` lift animation
- `role="button"` + `tabIndex={0}` + keyboard support (Enter/Space)
- Navigate to `/demo` (most cards) or open audit modal (pricing cards)

### Feature Deep Dive Animations

| Feature | Image Treatment |
|---|---|
| **Student Assignment** | `DashboardAnimated` — static screenshot + animated table rows sliding in with status badges |
| **Route Optimization** | `AnimatedRouteMap` — SVG with 5 animated buses moving along route paths, pulsing school, animated pins |
| **Contractor Oversight** | Static image (no animation) |
| **Parent Communication** | `ParentAppAnimated` — static screenshot + animated notification toasts cycling every 4s |

---

## 7. Design System

### Color Tokens (HSL in index.css `:root`)

| Token | HSL Value | Usage |
|---|---|---|
| `--background` | `225 14% 97%` | Page background |
| `--foreground` | `224 40% 14%` | Body text (dark navy) |
| `--primary` | `226 42% 14%` | Primary navy |
| `--accent` | `37 91% 55%` | Gold/amber CTAs |
| `--success` | `155 66% 40%` | Green highlights |
| `--destructive` | `7 93% 46%` | Error/danger red |
| `--muted` | `225 14% 97%` | Muted backgrounds |
| `--muted-foreground` | `217 18% 34%` | Secondary text |
| `--navy` | `226 42% 14%` | Brand navy alias |
| `--gold` | `37 91% 55%` | Brand gold alias |

### Typography

| Role | Font |
|---|---|
| Display / Headings | **Playfair Display** (serif) → `font-display` |
| Body / UI | **DM Sans** (sans-serif) → `font-body` |

### Animation

- `ScrollReveal` — Framer Motion wrapper, 6 directions, 32px travel, 0.6s duration, triggers once
- `AnimatedStat` — count-up number animation on scroll
- `AnimatedRouteMap` — SVG buses moving along paths with `<animateMotion>`
- `DashboardAnimated` — staggered row animation with status transitions
- `ParentAppAnimated` — cycling notification toasts with spring animations
- Section dividers — CSS gradient hairlines

---

## 8. Database Schema

### Tables (28 total)

**Multi-tenant core:**

| Table | Purpose | RLS |
|---|---|---|
| `districts` | Tenant table — all data references this | User's own district only |
| `profiles` | User profiles (extends auth.users) | Own row + district admin can see all |
| `district_user_roles` | Role assignments per district | Own district only |

**Public-facing:**

| Table | Purpose | RLS |
|---|---|---|
| `audit_requests` | Lead capture form submissions | Public insert |
| `safety_reports` | Safety incident reports | Public insert, admin read |
| `driver_reports` | Driver-submitted reports | Public insert, admin read |
| `driver_tips` | Tips from parents to drivers | Public insert |
| `report_alerts` | Auto-generated alerts | Admin only |

**Registration & residency:**

| Table | Purpose | RLS |
|---|---|---|
| `student_registrations` | Parent registration data | Parent-owned + admin |
| `residency_documents` | Uploaded residency docs | Parent-owned + admin |
| `residency_attestations` | E-signed attestations | Parent-owned + admin |
| `childcare_requests` | Childcare transport requests | Parent-owned + admin |
| `residency_audit_log` | Admin audit trail | Admin only |

**Contracts & financial:**

| Table | Purpose | RLS |
|---|---|---|
| `contracts` | Contractor contracts | Admin only |
| `contractor_insurance` | Insurance tracking | Admin only |
| `contract_invoices` | Invoice verification | Admin only |
| `contractor_performance` | Performance scorecards | Admin only |
| `bids` | Bid/RFP solicitations | Admin only |
| `bid_responses` | Contractor bid responses | Admin only |

**Routes & operations:**

| Table | Purpose | RLS |
|---|---|---|
| `routes` | Route data & metrics | Admin only |
| `route_stops` | Stop-level data with geocoding | Admin only |
| `route_scenarios` | Simulation scenarios | Admin only |

**Compliance:**

| Table | Purpose | RLS |
|---|---|---|
| `compliance_reports` | BEDS/STAC filings | Admin only |
| `compliance_training` | Staff training tracking | Admin only |
| `mckinney_vento_students` | Homeless student tracking | Admin only |
| `ed_law_2d_contractors` | Data privacy agreements | Admin only |
| `breach_incidents` | Data breach logs | Admin only |

**Auth (legacy):**

| Table | Purpose | RLS |
|---|---|---|
| `user_roles` | Legacy RBAC (admin/user) for `/admin/*` | Admin only |

### Key Enums

`ai_priority`, `app_role`, `audit_action`, `bid_status`, `bid_response_status`, `childcare_transport_type`, `contract_status`, `driver_report_type`, `insurance_status`, `invoice_status`, `registration_status`, `report_status`, `safety_report_type`

### Database Functions

| Function | Purpose |
|---|---|
| `has_role(_user_id, _role)` | Legacy RBAC check for `/admin/*` |
| `get_user_district_id()` | Returns caller's district_id |
| `get_user_role()` | Returns caller's role from district_user_roles |
| `has_app_role(required_role)` | Hierarchical role check for `/app/*` |
| `update_updated_at_column()` | Trigger function for updated_at columns |

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

## 9. Key Features

### Public Website
- **Homepage:** 22 sections, impact-first narrative, all cards clickable
- **Blog:** 66 posts across 5 categories, static TypeScript content
- **Demo:** Interactive 6-step product tour
- **Registration:** 6-step wizard for parent sign-up
- **Navigation:** Scroll-spy active highlighting, auth-aware Login/Dashboard link

### Authentication (`/login`)
- Email/password sign-in via Supabase Auth
- Google OAuth (managed by Lovable Cloud, no API key needed)
- Apple OAuth (managed by Lovable Cloud, no API key needed)
- Role-based redirect: parent → `/app/parent`, staff/admin → `/app/dashboard`

### App Shell (`/app/*`)
- Collapsible sidebar with role-filtered navigation
- Breadcrumb navigation on all pages
- District name + user avatar in top bar
- All pages currently in **placeholder** state (Coming Soon)
- Full role-based access control via `RoleGate`

### Legacy Admin (`/admin/*`)
- 11 sub-pages: safety reports, driver reports, residency, tips, alerts, analytics, contracts, invoices, bids, routes, compliance
- Separate `AdminLayout` with sidebar
- Protected by legacy `has_role()` + `user_roles` table

### Animated Feature Illustrations
- **Route Optimization:** SVG with 5 school buses animating along route paths
- **Student Assignment:** Dashboard screenshot with animated table rows and status transitions
- **Parent Communication:** App screenshot with cycling push notification overlays
- **Contractor Oversight:** Static image (no animation)

---

## 10. SEO & Accessibility

- `SEOHead` component (react-helmet-async) on all public pages
- Open Graph + Twitter Card meta tags
- `robots.txt` disallows `/admin/*` and `/app/*`
- `sitemap.xml` covers all public routes + blog posts
- Skip-to-content link in `index.html` targeting `#main-content`
- Semantic HTML with proper heading hierarchy
- All clickable cards have `role="button"`, `tabIndex={0}`, and keyboard handlers

---

## 11. Build & Config

- Vite 5 with SWC React plugin, dev server on port 8080
- Path alias: `@/` → `src/`
- TypeScript strict mode off
- Vitest configured for testing
- Auto-sitemap generation on build

---

## 12. Current Build State

### ✅ Completed
- Full public marketing website (22 homepage sections + all sub-pages)
- Blog system (66 posts)
- Interactive product demo tour
- Parent registration 6-step wizard
- Legacy admin dashboard (11 pages)
- Multi-tenant auth architecture (districts, profiles, roles, RLS)
- Login page with email + Google + Apple OAuth
- Signup redirect page
- App shell with sidebar layout and role-based navigation
- Protected routes with auth + role gates
- District context provider with useDistrict() hook
- Auth-aware navigation (Login/Dashboard link)
- All homepage cards are clickable (→ /demo or audit modal)
- Animated feature illustrations (route map, dashboard, parent notifications)
- Contractor Oversight copy updated with bid/RFP/contract management

### 🔲 Placeholder (Coming Soon)
- `/app/dashboard` — District dashboard
- `/app/students` — Student management
- `/app/routes` — Route management
- `/app/contracts` — Contract management
- `/app/compliance` — Compliance center
- `/app/reports` — Reports
- `/app/settings` — District settings
- `/app/parent/*` — Parent portal (4 pages)
- `/app/admin/*` — In-app admin (4 pages)

### 🔲 Not Yet Built
- Password reset flow (`/reset-password`)
- Profile onboarding for new users
- Real-time data in app pages
- Seed data for demo district ("Meadowbrook Central School District")
- Dark mode (not planned — navy sections provide contrast)

---

## 13. Conversion Strategy

- **Primary CTA:** "Get Free Audit" / "Start Your Free Route Audit"
- **No explicit pricing** — personalized assessments that highlight potential savings
- **ROI messaging:** Generalized district parameters (5,000 students, 45 routes)
- **Projected savings:** $710K–$1.6M in Year 1 based on $42B+ total market spend
- Districts are NOT self-serve — onboarded by RideLine's sales team

---

*End of blueprint.*
