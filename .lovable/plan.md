

# RideLine Build Prompts — Gap Analysis & Implementation Plan

## What's Already Done (Prompts 1–3 & 9–10 Partial)

Most of Prompts 1, 2, 3, 9, and 10 are **already implemented**:

- Hero tagline: "Every Student. Every Day." with gold italic emphasis
- Mobile hamburger menu with Framer Motion animation, slide-down, and X toggle
- Navigation with scroll shadow, section highlighting, and smooth scroll offset
- TrustBar with scrolling district logos and trust badges
- All homepage sections exist: LiveStatsDashboard, PlatformSection, ROISection, TestimonialsSection, ComparisonTable, FeatureDeepDives, WhoWeServeSection, SafetyDriverSection, ROICalculator, PricingSection, CoverageMapSection, CTASection, HowItWorks, TestimonialBanner, ProblemSection, QuestionsSection
- ScrollReveal with Framer Motion wrapping all sections
- BackToTop button
- SEOHead component on homepage
- Lazy loading for below-the-fold sections
- Admin dashboard with SafetyReports, DriverReports, Tips, Alerts, Analytics
- Supabase tables: audit_requests, safety_reports, driver_reports, driver_tips, report_alerts, user_roles
- RBAC with `has_role()` security definer function
- Blog system, About, Press, Careers, Contact, Demo, Resources, Privacy, Terms pages

## What's NOT Built Yet

### Prompt 4: Digital Registration & Parent Portal (LARGEST GAP)
**Nothing exists.** This is the biggest missing feature — the key product differentiator.

Required new work:
- `/register` page — 6-step multi-step form wizard (parent info, student info, address/residency with geocoding, document upload, childcare transportation, review & e-sign)
- `/reapply` page — returning-family flow with pre-populated data
- Supabase Auth for parent accounts (separate from admin auth)
- 4 new database tables: `student_registrations`, `residency_documents`, `residency_attestations`, `childcare_requests`
- Supabase Storage bucket for document uploads
- Address geocoding integration
- RLS policies for parent-owned data

### Prompt 5: Admin Residency Audit Dashboard
**Nothing exists.**

Required new work:
- `/admin/residency` page with stats bar, filterable registration table, auto-flag system, detail view with document preview, approve/deny/flag workflow
- 1 new table: `residency_audit_log`
- CSV export functionality
- RLS policies (admin-only)

### Prompt 6: Contract Management System
**Nothing exists.**

Required new work:
- `/admin/contracts` — contract dashboard with detail view, insurance tracking, performance scorecards
- `/admin/invoices` — invoice upload and verification with discrepancy detection
- `/admin/bids` — bid solicitation and weighted scoring
- 6 new tables: `contracts`, `contractor_insurance`, `contract_invoices`, `contractor_performance`, `bids`, `bid_responses`
- RLS policies (admin-only)

### Prompt 7: Route Analysis & Optimization
**Nothing exists.**

Required new work:
- `/admin/routes` — route dashboard with efficiency metrics, inefficiency detection cards, consolidation simulator, bell time modeling
- Recharts visualizations for capacity and efficiency
- 3 new tables: `routes`, `route_stops`, `route_scenarios`
- RLS policies (admin-only)

### Prompt 8: Compliance Center
**Nothing exists.**

Required new work:
- `/admin/compliance` — tabbed interface (BEDS/STAC, McKinney-Vento, Ed Law 2-d, Audit Readiness)
- Report generation and download
- 5 new tables: `compliance_reports`, `mckinney_vento_students`, `ed_law_2d_contractors`, `compliance_training`, `breach_incidents`
- RLS policies (admin-only)

### Prompt 10: Remaining Polish
Partially done. Still needed:
- SEOHead on all pages that don't have it (admin pages, etc.)
- Sitemap update for new routes (`/register`, `/reapply`)
- `robots.txt` — missing `Disallow: /admin/` rules
- 404 page — currently minimal, needs links to contact and blog
- Skip-to-content link for accessibility
- Lazy loading verification on admin routes

---

## Recommended Implementation Order

Given dependencies between features, here's the suggested sequence:

```text
Phase 1: Foundation (2-3 sessions)
├── Prompt 4: Registration system + Supabase Auth for parents
│   ├── DB tables + storage bucket + RLS
│   ├── /register (6-step wizard)
│   └── /reapply (returning family flow)
└── Prompt 5: Admin residency audit dashboard
    └── /admin/residency (reviews registrations from Prompt 4)

Phase 2: Admin Tools (3-4 sessions)
├── Prompt 6: Contract management
│   ├── /admin/contracts
│   ├── /admin/invoices
│   └── /admin/bids
├── Prompt 7: Route analysis
│   └── /admin/routes
└── Prompt 8: Compliance center
    └── /admin/compliance

Phase 3: Polish (1 session)
└── Prompt 10 remainders
    ├── SEOHead on all new pages
    ├── robots.txt update
    ├── 404 page enhancement
    ├── Sitemap update
    └── Accessibility pass
```

## Database Summary — 19 New Tables Total

| Prompt | Tables | Count |
|--------|--------|-------|
| 4 | student_registrations, residency_documents, residency_attestations, childcare_requests | 4 |
| 5 | residency_audit_log | 1 |
| 6 | contracts, contractor_insurance, contract_invoices, contractor_performance, bids, bid_responses | 6 |
| 7 | routes, route_stops, route_scenarios | 3 |
| 8 | compliance_reports, mckinney_vento_students, ed_law_2d_contractors, compliance_training, breach_incidents | 5 |

## Key Technical Decisions Needed

1. **Geocoding provider** — The registration form requires address geocoding and district boundary checking. This needs an external API (Google Maps, Mapbox, or similar). A connector or API key will be required.

2. **Parent auth vs admin auth** — Parents will use Supabase Auth for registration. The existing admin auth flow uses the same Supabase Auth with role-based access. Both can coexist — parents get no role, admins get the `admin` role in `user_roles`.

3. **Document storage** — Residency documents need a Supabase Storage bucket with RLS so parents can only access their own uploads and admins can access all.

## Recommendation

Start with **Prompt 4** (Registration system) since it's the largest feature, the key differentiator, and Prompt 5 depends on it. I can begin implementing it immediately — shall I proceed?

