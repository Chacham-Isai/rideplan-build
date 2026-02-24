# RideLine — Complete Project Blueprint (A–Z)

> **Last updated:** 2026-02-24
> **Purpose:** Hand this file to any AI assistant (Claude, GPT, etc.) so it can fully understand the project's architecture, tech stack, page flow, component tree, database schema, and design system in one read.

---

## 1. What Is RideLine?

RideLine is a **B2B SaaS marketing website** for a school-bus transportation management platform. The product replaces spreadsheets, phone calls, and guesswork with a single command center for school-district transportation offices. Key value props:

- Route optimization → saves districts $710K–$1.6M in Year 1
- Real-time GPS tracking for parents
- AI-powered safety reporting & driver management
- Coverage across the U.S. Northeast (expanding)

The website is a **high-conversion landing page** plus specialized sub-pages (blog, demo, resources, driver portal, tipping, admin dashboard, etc.).

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

### Key Packages

```
framer-motion ^12.34.0    # scroll reveals, page transitions
lucide-react ^0.462.0     # icon library
react-router-dom ^6.30.1  # client-side routing
@tanstack/react-query ^5  # async state management
zod ^3.25.76              # schema validation
react-helmet-async ^2     # SEO meta tags
recharts ^2.15.4          # data visualization
sonner ^1.7.4             # toast notifications
react-markdown ^10        # blog content rendering
```

---

## 3. Project Structure

```
├── public/
│   ├── favicon.ico
│   ├── og-default.png          # Open Graph image
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── generate-sitemap.ts     # Auto-generates sitemap on build
├── src/
│   ├── assets/                 # Static images (imported as ES6 modules)
│   │   ├── rideline-logo-*.png
│   │   ├── rideline-dashboard.png
│   │   ├── rideline-fleet-overview.png
│   │   ├── rideline-parent-safety.webp
│   │   ├── rideline-coverage-map.png
│   │   └── ... (13 total asset images)
│   ├── components/
│   │   ├── sections/           # 22 landing-page section components
│   │   ├── admin/              # Admin layout
│   │   ├── ui/                 # 50+ shadcn/ui primitives
│   │   ├── AnimatedStat.tsx    # Counter animation component
│   │   ├── BackToTop.tsx       # Scroll-to-top button
│   │   ├── ChatWidget.tsx      # AI chat floating widget
│   │   ├── ContactFormModal.tsx # Lead capture modal (Zod + Supabase)
│   │   ├── NavLink.tsx
│   │   ├── ScrollReveal.tsx    # Framer Motion scroll-triggered animations
│   │   └── SEOHead.tsx         # Helmet-based SEO component
│   ├── data/
│   │   ├── blogPosts.ts        # Core blog post content (~764 lines)
│   │   └── additionalBlogPosts.ts  # Extended blog posts (66 total)
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Mobile breakpoint detection
│   │   ├── use-toast.ts
│   │   ├── useCountUp.ts       # Number counter animation
│   │   └── useScrollReveal.ts  # InView hook for scroll animations
│   ├── integrations/supabase/
│   │   ├── client.ts           # Auto-generated Supabase client
│   │   └── types.ts            # Auto-generated DB types
│   ├── lib/utils.ts            # cn() helper (clsx + tailwind-merge)
│   ├── pages/                  # 17 page components
│   │   ├── Index.tsx           # Homepage (lazy-loaded sections)
│   │   ├── About.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Careers.tsx
│   │   ├── Contact.tsx
│   │   ├── Demo.tsx
│   │   ├── DriverPortal.tsx
│   │   ├── NotFound.tsx
│   │   ├── Press.tsx
│   │   ├── Privacy.tsx
│   │   ├── Resources.tsx
│   │   ├── SafetyReport.tsx
│   │   ├── Terms.tsx
│   │   ├── TipDriver.tsx
│   │   ├── AdminLogin.tsx
│   │   └── admin/              # 5 admin sub-pages
│   │       ├── SafetyReportsAdmin.tsx
│   │       ├── DriverReportsAdmin.tsx
│   │       ├── TipsAdmin.tsx
│   │       ├── AlertsAdmin.tsx
│   │       └── AnalyticsAdmin.tsx
│   ├── App.tsx                 # Router + providers
│   ├── App.css
│   ├── index.css               # Design system tokens + global styles
│   └── main.tsx                # Entry point
├── supabase/
│   ├── config.toml             # Supabase project config (auto-managed)
│   └── functions/
│       ├── chat/index.ts       # AI chatbot edge function
│       └── analyze-reports/index.ts  # Report analysis edge function
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── vitest.config.ts
```

---

## 4. Routing Map

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
| `/admin/login` | `AdminLogin` | Admin authentication |
| `/admin` | `AdminLayout` → `SafetyReportsAdmin` | Admin: safety reports |
| `/admin/driver-reports` | `DriverReportsAdmin` | Admin: driver reports |
| `/admin/tips` | `TipsAdmin` | Admin: tips management |
| `/admin/alerts` | `AlertsAdmin` | Admin: alert management |
| `/admin/analytics` | `AnalyticsAdmin` | Admin: analytics dashboard |
| `*` | `NotFound` | 404 page |

---

## 5. Homepage Section Flow (Current Order)

The homepage uses lazy-loading (`React.lazy`) and `ScrollReveal` wrappers for all below-the-fold sections:

```
1.  AnnouncementBar        — top sticky bar
2.  Navigation             — sticky nav with section scroll-spy
3.  HeroSection            — "Every Student. Every Day." + stats + CTAs
4.  TrustBar               — partner/client logos
5.  LiveStatsDashboard     — real-time animated metrics
6.  PlatformSection        — module cards overview
7.  ROISection             — ROI value proposition
8.  TestimonialsSection    — customer quotes
9.  ComparisonTable        — Before vs. After comparison
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

Each section wrapped in `<ScrollReveal>` with direction variants: `up`, `down`, `left`, `right`, `scale`, `fade`.

---

## 6. Design System

### 6.1 Color Tokens (HSL in index.css `:root`)

| Token | HSL Value | Usage |
|---|---|---|
| `--background` | `225 14% 97%` | Page background (off-white) |
| `--foreground` | `224 40% 14%` | Body text (dark navy) |
| `--primary` | `226 42% 14%` | Primary navy |
| `--primary-foreground` | `210 40% 98%` | White text on navy |
| `--secondary` | `210 40% 96.1%` | Light gray sections |
| `--accent` | `37 91% 55%` | Gold/amber CTAs |
| `--accent-foreground` | `226 42% 14%` | Text on gold |
| `--success` | `155 66% 40%` | Green highlights |
| `--destructive` | `7 93% 46%` | Error/danger red |
| `--muted` | `225 14% 97%` | Muted backgrounds |
| `--muted-foreground` | `217 18% 34%` | Secondary text |
| `--navy` | `226 42% 14%` | Brand navy (alias) |
| `--navy-mid` | `224 40% 20%` | Mid navy |
| `--gold` | `37 91% 55%` | Brand gold (alias) |
| `--gold-light` | `43 96% 67%` | Light gold hover |
| `--green` | `155 66% 40%` | Success green |
| `--red` | `7 93% 46%` | Danger red |

### 6.2 Typography

| Role | Font | Config |
|---|---|---|
| Display / Headings | **Playfair Display** (serif) | `font-display` class |
| Body / UI | **DM Sans** (sans-serif) | `font-body` class |

### 6.3 Animation System

- **ScrollReveal component** wraps sections with Framer Motion
  - Directions: `up`, `down`, `left`, `right`, `scale`, `fade`
  - Default: 32px travel, 0.6s duration, cubic-bezier `[0.16, 1, 0.3, 1]`
  - Triggers once when element enters viewport (`margin: -40px`)
- **AnimatedStat** — count-up number animation on scroll
- **Section dividers** — CSS `::before` gradient hairlines between sections
- **`will-change: opacity`** on main sections for GPU compositing

### 6.4 Tailwind Extensions

Custom colors in `tailwind.config.ts` map to CSS variables: `navy`, `gold`, `green`, `red`, `success`, `sidebar-*`.

Border radius: `--radius: 0.5rem` with `lg`, `md`, `sm` variants.

---

## 7. Database Schema (Supabase / Lovable Cloud)

### Tables

| Table | Purpose |
|---|---|
| `audit_requests` | Lead capture form submissions (name, email, district, students) |
| `safety_reports` | Parent/community safety incident reports |
| `driver_reports` | Driver-submitted reports (incident, maintenance, schedule) |
| `driver_tips` | Tips from parents to drivers |
| `report_alerts` | Auto-generated alerts from report patterns |
| `user_roles` | Role-based access control (admin/user) |

### Enums

| Enum | Values |
|---|---|
| `ai_priority` | `low`, `medium`, `high`, `critical` |
| `app_role` | `admin`, `user` |
| `driver_report_type` | `incident`, `maintenance`, `schedule`, `other` |
| `report_status` | `new`, `reviewing`, `resolved` |
| `safety_report_type` | `bullying`, `driver_safety`, `other` |

### Database Function

- `has_role(_role, _user_id)` → boolean — checks if user has a specific role

### Edge Functions

| Function | Purpose |
|---|---|
| `chat` | AI chatbot — answers visitor questions about RideLine |
| `analyze-reports` | AI-powered analysis of safety/driver reports |

---

## 8. Key Components Deep Dive

### Navigation (`sections/Navigation.tsx`)
- Sticky nav with scroll-spy using `IntersectionObserver`
- 9 links: 5 section anchors (`#platform`, `#features`, `#safety`, `#pricing`, `#how-it-works`) + 4 routes (`/demo`, `/resources`, `/about`, `/blog`)
- Animated hamburger menu (Framer Motion) for mobile
- "Get Free Audit" CTA button opens `ContactFormModal`

### ContactFormModal
- Zod-validated form: name, email, district, students
- Submits to `audit_requests` table via Supabase client
- Success state with checkmark animation

### ChatWidget
- Floating chat bubble (bottom-right)
- Calls `/functions/v1/chat` edge function
- Markdown rendering for AI responses
- Suggested questions for quick interaction

### ScrollReveal
- Reusable Framer Motion wrapper
- `useInView` hook triggers once
- 6 animation directions with configurable distance/duration/delay

### SEOHead
- `react-helmet-async` for meta tags
- Open Graph + Twitter Card support
- Canonical URLs

---

## 9. Blog System

- **66 total blog posts** across categories: Cost Savings, Safety, Technology, Operations, Community
- Content stored as TypeScript string literals in `src/data/blogPosts.ts` and `additionalBlogPosts.ts`
- Rendered with `react-markdown`
- Each post has: `slug`, `title`, `excerpt`, `category`, `readTime`, `date`, `author`, `authorRole`, `content`

---

## 10. Admin System

- Protected by `AdminLogin` page (Supabase Auth)
- `AdminLayout` wraps admin sub-pages with sidebar navigation
- 5 admin views: Safety Reports, Driver Reports, Tips, Alerts, Analytics
- Role-based access via `user_roles` table + `has_role()` function

---

## 11. Build & Config

### Vite Config
- SWC React plugin for fast HMR
- Auto-sitemap generation on build via custom plugin
- Path alias: `@/` → `src/`
- Dev server on port 8080

### TypeScript
- Strict mode off (`noImplicitAny: false`, `strictNullChecks: false`)
- Path aliases configured in both `tsconfig.json` and Vite

### Testing
- Vitest configured (`vitest.config.ts`)
- Test setup in `src/test/setup.ts`

---

## 12. Environment Variables

| Variable | Source | Usage |
|---|---|---|
| `VITE_SUPABASE_URL` | Auto-configured | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Auto-configured | Anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Auto-configured | Project identifier |

---

## 13. Performance Optimizations

1. **Lazy loading** — All below-the-fold homepage sections use `React.lazy()`
2. **Image optimization** — WebP format for key images, `loading="lazy"` attributes
3. **GPU compositing** — `will-change: opacity` on animated sections
4. **Scroll animation** — `useInView` with `once: true` prevents re-triggering
5. **Code splitting** — Route-based splitting via React Router

---

## 14. URLs

| Environment | URL |
|---|---|
| Preview | `https://id-preview--049f4c21-1133-4b2a-93e7-cdef6ca8fca0.lovable.app` |
| Published | `https://rideplan-build.lovable.app` |

---

## 15. Current State & Notes

- The homepage section order was recently reorganized for an "impact-first" flow (stats → platform → ROI → testimonials → comparison → features → safety → pricing)
- Scroll animations were refined: softer travel (32px), smoother easing, gradient hairline dividers between sections
- The hero tagline is: **"Every Student. Every Day."**
- The primary CTA across the site is **"Get Free Audit"** / **"Start Your Free Route Audit"**
- No dark mode implemented (light theme only with navy sections for contrast)
- Blog content is static (no CMS), stored in TypeScript files

---

*End of blueprint. This document provides complete context for any AI assistant to understand and continue development on the RideLine project.*
