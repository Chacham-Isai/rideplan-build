# RideLine — Complete Project Blueprint (A–Z)

> **Last updated:** 2026-02-24
> **Purpose:** Hand this file to any AI assistant (Claude, GPT, etc.) so it can fully understand the project's architecture, tech stack, page flow, component tree, database schema, and design system in one read.

---

## 1. What Is RideLine?

RideLine is a **B2B SaaS marketing website** for a school-bus transportation management platform. The product replaces spreadsheets, phone calls, and guesswork with a single command center for school-district transportation offices. Key value props:

- Route optimization → saves districts $710K–$1.6M in Year 1
- Real-time GPS tracking for parents
- AI-powered safety reporting & driver management
- Digital student registration & residency verification
- Contract management, invoicing & bid solicitation
- Compliance center (BEDS/STAC, McKinney-Vento, Ed Law 2-d)
- Coverage across the U.S. Northeast (expanding)

The website is a **high-conversion landing page** plus specialized sub-pages (blog, demo, resources, driver portal, tipping, parent registration, admin dashboard, etc.).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite (with SWC plugin) |
| **Styling** | Tailwind CSS 3 + CSS custom properties (HSL tokens) |
| **UI Kit** | shadcn/ui (Radix primitives) |
| **Animation** | Framer Motion 12 |
| **Routing** | React Router DOM 6 |
| **State / Data** | TanStack React Query 5 |
| **Forms** | React Hook Form + Zod validation |
| **SEO** | react-helmet-async |
| **Charts** | Recharts |
| **Backend** | Lovable Cloud (Supabase under the hood) |
| **Edge Functions** | Deno (Supabase Edge Functions) |
| **Markdown** | react-markdown (blog content) |

---

## 3. Project Structure

```
├── public/
│   ├── favicon.ico
│   ├── og-default.png
│   ├── robots.txt              # Disallows /admin/*
│   └── sitemap.xml             # All public routes
├── scripts/
│   └── generate-sitemap.ts
├── src/
│   ├── assets/                 # Static images (imported as ES6 modules)
│   ├── components/
│   │   ├── sections/           # 22 landing-page section components
│   │   ├── admin/              # AdminLayout with sidebar navigation
│   │   ├── registration/       # RegisterWizard + 6 step components
│   │   ├── ui/                 # 50+ shadcn/ui primitives
│   │   ├── AnimatedStat.tsx
│   │   ├── BackToTop.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── ContactFormModal.tsx
│   │   ├── NavLink.tsx
│   │   ├── ScrollReveal.tsx
│   │   └── SEOHead.tsx
│   ├── data/
│   │   ├── blogPosts.ts
│   │   └── additionalBlogPosts.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useCountUp.ts
│   │   └── useScrollReveal.ts
│   ├── integrations/supabase/
│   │   ├── client.ts           # Auto-generated
│   │   └── types.ts            # Auto-generated
│   ├── lib/utils.ts
│   ├── pages/
│   │   ├── Index.tsx           # Homepage (lazy-loaded sections)
│   │   ├── About.tsx
│   │   ├── Blog.tsx / BlogPost.tsx
│   │   ├── Careers.tsx
│   │   ├── Contact.tsx
│   │   ├── Demo.tsx
│   │   ├── DriverPortal.tsx
│   │   ├── NotFound.tsx        # Enhanced 404 with navigation links
│   │   ├── Press.tsx
│   │   ├── Privacy.tsx / Terms.tsx
│   │   ├── Register.tsx        # Parent registration (6-step wizard)
│   │   ├── Reapply.tsx         # Returning-family flow
│   │   ├── Resources.tsx
│   │   ├── SafetyReport.tsx
│   │   ├── TipDriver.tsx
│   │   ├── AdminLogin.tsx
│   │   └── admin/              # 11 admin sub-pages
│   │       ├── SafetyReportsAdmin.tsx
│   │       ├── DriverReportsAdmin.tsx
│   │       ├── ResidencyAdmin.tsx
│   │       ├── TipsAdmin.tsx
│   │       ├── AlertsAdmin.tsx
│   │       ├── AnalyticsAdmin.tsx
│   │       ├── ContractsAdmin.tsx
│   │       ├── InvoicesAdmin.tsx
│   │       ├── BidsAdmin.tsx
│   │       ├── RoutesAdmin.tsx
│   │       └── ComplianceAdmin.tsx
│   ├── App.tsx
│   ├── index.css               # Design system tokens
│   └── main.tsx
├── supabase/
│   ├── config.toml
│   └── functions/
│       ├── chat/index.ts
│       └── analyze-reports/index.ts
├── index.html                  # Includes skip-to-content link
├── tailwind.config.ts
└── vite.config.ts
```

---

## 4. Routing Map

### Public Routes

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
| `*` | `NotFound` | 404 page with links to home, contact, blog |

### Admin Routes (protected, disallowed in robots.txt)

| Path | Component | Description |
|---|---|---|
| `/admin/login` | `AdminLogin` | Admin authentication |
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

## 5. Homepage Section Flow

Lazy-loaded with `React.lazy()` and `ScrollReveal` wrappers:

```
1.  AnnouncementBar        — top sticky bar
2.  Navigation             — sticky nav with scroll-spy
3.  HeroSection            — "Every Student. Every Day." + stats + CTAs
4.  TrustBar               — partner/client logos
5.  LiveStatsDashboard     — real-time animated metrics
6.  PlatformSection        — module cards overview
7.  ROISection             — ROI value proposition
8.  TestimonialsSection    — customer quotes
9.  ComparisonTable        — Before vs. After
10. FeatureDeepDives       — detailed feature breakdowns
11. WhoWeServeSection      — audience segments
12. SafetyDriverSection    — safety & driver features
13. ROICalculator          — interactive savings calculator
14. ProblemSection         — pain points
15. QuestionsSection       — FAQ accordion
16. HowItWorks            — step-by-step process
17. TestimonialBanner      — social proof banner
18. PricingSection         — pricing tiers
19. CoverageMapSection     — service area map
20. CTASection             — final call-to-action
21. Footer                 — site footer
```

---

## 6. Design System

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
- Section dividers — CSS gradient hairlines

---

## 7. Database Schema

### Tables (25 total)

| Table | Purpose | RLS |
|---|---|---|
| `audit_requests` | Lead capture form submissions | Public insert |
| `safety_reports` | Safety incident reports | Public insert, admin read |
| `driver_reports` | Driver-submitted reports | Public insert, admin read |
| `driver_tips` | Tips from parents to drivers | Public insert |
| `report_alerts` | Auto-generated alerts | Admin only |
| `user_roles` | RBAC (admin/user) | Admin only |
| `student_registrations` | Parent registration data | Parent-owned + admin |
| `residency_documents` | Uploaded residency docs | Parent-owned + admin |
| `residency_attestations` | E-signed attestations | Parent-owned + admin |
| `childcare_requests` | Childcare transport requests | Parent-owned + admin |
| `residency_audit_log` | Admin audit trail | Admin only |
| `contracts` | Contractor contracts | Admin only |
| `contractor_insurance` | Insurance tracking | Admin only |
| `contract_invoices` | Invoice verification | Admin only |
| `contractor_performance` | Performance scorecards | Admin only |
| `bids` | Bid solicitations | Admin only |
| `bid_responses` | Contractor bid responses | Admin only |
| `routes` | Route data & metrics | Admin only |
| `route_stops` | Stop-level data with geocoding | Admin only |
| `route_scenarios` | Simulation scenarios | Admin only |
| `compliance_reports` | BEDS/STAC filings | Admin only |
| `mckinney_vento_students` | Homeless student tracking | Admin only |
| `ed_law_2d_contractors` | Data privacy agreements | Admin only |
| `compliance_training` | Staff training tracking | Admin only |
| `breach_incidents` | Data breach logs | Admin only |

### Key Enums

`ai_priority`, `app_role`, `audit_action`, `bid_status`, `bid_response_status`, `childcare_transport_type`, `contract_status`, `driver_report_type`, `insurance_status`, `invoice_status`, `registration_status`, `report_status`, `safety_report_type`

### Database Function

- `has_role(_role, _user_id)` → boolean — RBAC check used in RLS policies

### Edge Functions

| Function | Purpose |
|---|---|
| `chat` | AI chatbot for visitor questions |
| `analyze-reports` | AI-powered report analysis |

---

## 8. Key Features

### Parent Registration System (`/register`)
- 6-step wizard: Parent Info → Student Info → Address/Residency → Document Upload → Childcare Transport → Review & E-sign
- Supabase Auth for parent accounts
- Document upload to Supabase Storage
- Returning-family flow at `/reapply`

### Admin Dashboard (`/admin/*`)
- Protected by Supabase Auth + `has_role()` RBAC
- 11 sub-pages covering: safety reports, driver reports, residency audits, tips, alerts, analytics, contracts, invoices, bids, routes, compliance
- `AdminLayout` wraps all admin pages with sidebar navigation

### Route Analysis (`/admin/routes`)
- 4-tab interface: Routes table, Inefficiency detection, Consolidation simulator, Analytics charts
- Flags low utilization (<50%), excessive ride times (>60 min), high-cost routes

### Compliance Center (`/admin/compliance`)
- 4-tab interface: BEDS/STAC filings, McKinney-Vento tracker, Ed Law 2-d dashboard, Audit Readiness score
- Composite 0-100% audit readiness score

### Blog System
- 66 posts across categories: Cost Savings, Safety, Technology, Operations, Community
- Static content in TypeScript files, rendered with react-markdown

---

## 9. SEO & Accessibility

- `SEOHead` component (react-helmet-async) on all public pages
- Open Graph + Twitter Card meta tags
- `robots.txt` disallows `/admin/*`
- `sitemap.xml` covers all public routes + blog posts
- Skip-to-content link in `index.html` targeting `#main-content`
- Semantic HTML with proper heading hierarchy

---

## 10. Build & Config

- Vite with SWC React plugin, dev server on port 8080
- Path alias: `@/` → `src/`
- TypeScript strict mode off
- Vitest configured for testing
- Auto-sitemap generation on build

---

## 11. Current State

- All 10 build prompts are **implemented**
- Homepage uses "impact-first" section order
- Hero tagline: **"Every Student. Every Day."**
- Primary CTA: **"Get Free Audit"** / **"Start Your Free Route Audit"**
- Light theme only (no dark mode) — navy sections provide contrast
- Blog content is static (no CMS)
- Admin pages blocked from search engines via robots.txt

---

*End of blueprint.*
