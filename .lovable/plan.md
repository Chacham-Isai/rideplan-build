

# Safety & Driver Engagement Module

This plan adds both marketing sections on the homepage and working submission forms for three new capabilities: Parent Safety Reporting, Driver Portal, and Driver Tipping.

## What You'll Get

### 1. New Homepage Section: "Safety & Driver Experience"
A new section on the homepage (between existing sections) showcasing three pillars:
- **Parent Safety Portal** -- Report bullying or driver safety concerns with automatic school/bus company alerts
- **Driver Portal** -- Drivers can report incidents, request schedule changes, or flag maintenance issues
- **Driver Tipping** -- Parents can tip drivers during holidays, bad weather, or just to say thanks

### 2. Working Parent Safety Report Form (/report)
A standalone page with a simple form (no login required) where parents can:
- Select report type (Bullying, Driver Safety Concern, Other)
- Enter their child's school, bus number, date of incident
- Describe what happened
- Provide their name and contact info
- Submit goes to the database and shows a confirmation

### 3. Working Driver Portal Form (/driver-portal)
A standalone page where drivers can:
- Select type (Incident Report, Maintenance Request, Schedule Request, Other)
- Enter their name, bus number, route info
- Describe the issue
- Submit goes to the database and shows a confirmation

### 4. AI Pattern Monitoring (Backend)
An edge function that analyzes submitted reports to detect patterns:
- Multiple reports against the same bus number trigger an alert flag
- Bullying reports are auto-flagged as high priority
- Results stored as a priority flag on each report

### 5. Driver Tipping Page (/tip-driver)
A simple page where parents can:
- Enter the bus number or driver name
- Select a tip amount ($5, $10, $20, custom)
- Leave an optional thank-you note
- For now, this captures the intent and stores it (actual payment integration can be added later with Stripe)

### 6. Navigation & Footer Updates
- Add "Safety" link in the main navigation
- Add "Driver Portal" and "Tip a Driver" links in the footer

---

## Technical Details

### Database Tables (4 new tables)

**safety_reports**
- id, created_at, report_type (enum: bullying, driver_safety, other), school_name, bus_number, incident_date, description, reporter_name, reporter_email, reporter_phone, status (enum: new, reviewing, resolved), ai_priority (enum: low, medium, high, critical)
- RLS: public INSERT, no SELECT/UPDATE/DELETE (same pattern as audit_requests)

**driver_reports**
- id, created_at, report_type (enum: incident, maintenance, schedule, other), driver_name, bus_number, route_info, description, contact_info, status (enum: new, reviewing, resolved)
- RLS: public INSERT only

**driver_tips**
- id, created_at, bus_number, driver_name, tip_amount (numeric), message, tipper_name, tipper_email
- RLS: public INSERT only

**report_alerts**
- id, created_at, alert_type (text), bus_number, report_count (integer), details (text), acknowledged (boolean default false)
- RLS: no public access (backend-only via service role)

### Edge Function: analyze-reports
- Triggered after each safety report submission
- Queries recent reports for the same bus number
- If 3+ reports exist for the same bus, creates an alert in report_alerts
- All bullying reports auto-flagged as "high" priority
- Uses Lovable AI to classify severity from the description text

### New Pages & Components
- `/report` -- SafetyReportPage with form + Zod validation
- `/driver-portal` -- DriverPortalPage with form + Zod validation
- `/tip-driver` -- TipDriverPage with amount selector + message
- New homepage section: SafetyDriverSection showcasing all three features
- All pages use existing Navigation + Footer layout

### Routes Added to App.tsx
```text
/report        -> SafetyReportPage
/driver-portal -> DriverPortalPage
/tip-driver    -> TipDriverPage
```

### File Summary
- `src/pages/SafetyReport.tsx` (new)
- `src/pages/DriverPortal.tsx` (new)
- `src/pages/TipDriver.tsx` (new)
- `src/components/sections/SafetyDriverSection.tsx` (new homepage section)
- `supabase/functions/analyze-reports/index.ts` (new edge function)
- `src/App.tsx` (add 3 routes)
- `src/pages/Index.tsx` (add SafetyDriverSection)
- `src/components/sections/Navigation.tsx` (add Safety link)
- `src/components/sections/Footer.tsx` (add portal links)
- Database migration for 4 new tables + enums

