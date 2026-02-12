

# RideLine — Marketing Website Build Plan

## Overview
Build a premium, single-page scrolling marketing website for RideLine, a K–12 school transportation SaaS platform. The site targets school district administrators with an authoritative, data-driven, ROI-focused tone. Uses the provided brand assets (logos, illustrations) throughout.

## Brand & Design System
- **Colors**: Navy (#151D33) primary, Gold (#F5A623) accent, Green (#22A06B) for savings, Red (#DE350B) for problems, Off-white (#F7F8FA) backgrounds
- **Typography**: Playfair Display for headings (serif, editorial), DM Sans for body (clean sans-serif)
- **Tone**: Professional, urgent, data-heavy with concrete dollar amounts
- **Assets**: Embed the provided RideLine logos (horizontal for nav/footer, dark background version, icon) and illustrations (route optimization, cost savings, dashboard, parent app, administrator) in relevant sections

## Page Sections (Single Scrolling Page)

### 1. Announcement Bar
- Dismissable gold banner with district count and "Schedule your free route audit" CTA

### 2. Sticky Navigation
- Logo (horizontal version) on left, section links (Platform, Features, Savings, How It Works), "Get Free Audit" CTA button, mobile hamburger menu, shadow on scroll

### 3. Hero Section
- Dark navy background with subtle grid pattern and radial gradient blobs
- Pulsing badge: "The Operating System for School Transportation"
- Headline: "Every Route. Every Dollar. Every Student." with gold italic accent
- Subheadline with $710K–$1.6M savings callout
- Two CTAs: gold "Start Your Free Route Audit" + ghost "See the Platform"
- Four stat counters: $15B+, 120K+, 5.9M+, 12–25x
- Staggered fade-in animations

### 4. Trust/Region Bar
- Light gray strip showing target states: NY, NJ, CT, PA, MD, DE

### 5. Problem Section (Red Accent)
- 6 pain-point cards in responsive grid (3→2→1 columns)
- Topics: legacy routes, unverified invoices, parent complaints, no cost visibility, driver shortages, SPED cost explosion
- Red top accent on hover, lift effect, scroll-reveal animation

### 6. Platform Section (Dark Navy)
- 6 module cards: Student Assignment, Route Optimization, Contractor Oversight, Parent Communication, Compliance & Reporting, AI Analytics
- Green pill tags with key metrics, gold border glow on hover

### 7. Before/After Comparison Table
- Styled table with red "Today" vs green "With RideLine" columns
- 7 operation rows showing transformation (e.g., "Check 4 spreadsheets" → "Auto-assigned in seconds")

### 8. ROI / Savings Section
- Navy gradient card, two-column layout
- Left: context and ROI badge (12–25x)
- Right: itemized savings totaling $710K–$1.6M with gold-accented total

### 9. Feature Deep-Dives (3 Alternating Rows)
- Student Assignment Engine, Route Optimization, Contractor Oversight
- Each with eyebrow, headline, body text, feature checklist, and visual card with icons/data
- Embed relevant uploaded images (route optimization illustration, dashboard view, cost savings graphic) as visual elements in these sections

### 10. Six Questions Section
- 6 numbered question cards in 3×2 grid highlighting the data gap
- Gold border hover effect

### 11. How It Works (3 Steps)
- Connected step cards: Free Route Audit (Weeks 1–2) → Configure & Integrate (Weeks 3–8) → Launch & Optimize (Weeks 9–12)
- Color-coded circles: gold, navy, green

### 12. Testimonial/Quote Banner
- Dark navy, centered italic quote about ROI vs. cost

### 13. By the Numbers
- 4 large stat cards with Playfair Display numbers and gold accent characters

### 14. CTA Section
- Navy gradient card with "Stop Guessing. Start Optimizing." headline
- Gold CTA button, radial glow effects

### 15. Footer
- Dark navy, 4 columns: Brand, Platform, Company, Resources
- Bottom bar with copyright and social icons

## Interactions & Animation
- Framer Motion scroll-reveal animations (fade-in-up) on all sections
- Smooth anchor scrolling with sticky nav offset
- Card hover effects: lift, shadow, border color changes
- Dismissable announcement bar with X button
- Mobile-responsive hamburger menu

## Technical Notes
- Single-page React app with section-based smooth scrolling
- Framer Motion for animations (new dependency)
- Google Fonts: Playfair Display + DM Sans
- All provided images embedded as assets in relevant sections
- No backend needed — this is a static marketing site
- Fully responsive across mobile, tablet, and desktop

