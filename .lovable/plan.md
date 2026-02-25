

# Plan: Automate District Workflow Document in Dashboard

## Workflow Document Analysis

The uploaded PDF outlines 5 operational areas that a district transportation office handles daily. Here is a gap analysis mapping each workflow item to what currently exists and what needs to be built.

### Current Coverage vs Gaps

```text
WORKFLOW AREA          | STATUS      | EXISTING MODULE
───────────────────────┼─────────────┼──────────────────────────────
I. SECRETARIAL
  Calls/Emails/Texts   | MISSING     | No communication/ticket system
  Stop Changes          | MISSING     | route_stops table exists, no request flow
  Driver Issues         | PARTIAL     | driver_reports exists (public portal only)
  Address Changes       | MISSING     | No change-request workflow
  School Changes        | MISSING     | No change-request workflow
  Appointments          | MISSING     | No scheduling system
  Registration          | DONE        | RegisterWizard + Students page
  Private School Reg    | PARTIAL     | Same wizard, no private school flag
  Birth Cert / Docs     | DONE        | Document upload in registration

II. TRANSPORTATION
  Route Efficiency      | DONE        | Routes page (utilization, ghost routes)
  Ride Time / Looping   | DONE        | avg_ride_time, long ride filter
  Special Ed / Homeless | DONE        | IEP/504/MV/FC flags + filters
  Aides & Monitors      | MISSING     | No aide/monitor tracking
  Bus Company Comms     | MISSING     | No communication log
  GPS Tracking          | MISSING     | No GPS data integration
  Bus Passes            | MISSING     | No bus pass generation
  Eligibility           | MISSING     | No distance-based eligibility calc
  Reregistration        | DONE        | Reapply flow exists
  School Communication  | MISSING     | No school comms log
  Other District Coord  | MISSING     | No inter-district module
  Piggyback / Shared    | MISSING     | No shared services tracking

III. BUSINESS
  Bids & Contracts      | DONE        | Contracts page + Bids admin
  State Forms           | DONE        | Compliance (BEDS/STAC)
  Payments / Invoices   | DONE        | Invoice auditing in Contracts
  19A Certifications    | MISSING     | No driver certification tracking
  Insurance             | DONE        | contractor_insurance table + UI
  STAC                  | DONE        | Compliance page
  Legal / Regulation    | PARTIAL     | Ed Law 2-d tracked

IV. OTHER
  NYSED                 | PARTIAL     | Compliance reports
  Ed Law 2-d            | DONE        | Full Ed Law 2-d module

V. FLEET (own fleet)
  Fleet Management      | MISSING     | No fleet module (N/A for contracted)
```

## Implementation Plan

### Phase 1: Service Request Hub (covers Secretarial workflows)

Create a new `service_requests` table and a **"Requests"** page that acts as the central inbox for all secretarial tasks: stop changes, address changes, school changes, driver issues, and general inquiries.

**Database migration:**
- New `service_requests` table with columns: `id`, `district_id`, `parent_user_id` (nullable), `request_type` (enum: `stop_change`, `address_change`, `school_change`, `driver_issue`, `general_inquiry`, `bus_pass`), `student_registration_id` (nullable FK), `subject`, `description`, `current_value`, `requested_value`, `priority`, `status` (open/in_progress/resolved/closed), `assigned_to`, `resolved_at`, `created_at`
- RLS: parents can insert/view own requests; district staff can view/update all within their district
- New `service_request_notes` table for threaded responses: `id`, `request_id`, `user_id`, `note`, `created_at`

**New page: `/app/requests`** (add to sidebar as "Requests" with `MessageSquare` icon)
- Summary cards: Open Requests, Avg Resolution Time, By Type breakdown
- Filterable table with type, priority, status, date, student name
- Detail dialog with timeline of notes, status update buttons
- Parents can submit requests from their portal

**Dashboard integration:**
- Add "Open Requests" stat card linking to `/app/requests`
- Add quick action: "View Requests"

### Phase 2: Bus Pass & Eligibility System

**Database migration:**
- New `bus_passes` table: `id`, `registration_id`, `district_id`, `pass_number`, `school_year`, `status` (active/expired/revoked), `issued_at`, `expires_at`
- New `eligibility_rules` table: `id`, `district_id`, `grade_range_start`, `grade_range_end`, `min_distance_miles`, `school_year`

**Students page enhancement:**
- Add "Generate Bus Pass" button in student detail dialog
- Add eligibility badge based on `distance_to_school` vs district rules
- Bulk bus pass generation for approved students

**Dashboard integration:**
- Add "Bus Passes Issued" to bottom stats row

### Phase 3: 19A Driver Certification Tracking

**Database migration:**
- New `driver_certifications` table: `id`, `district_id`, `driver_name`, `contractor_id` (nullable), `certification_type` (19a_initial, 19a_biennial, cdl, medical), `issued_date`, `expiration_date`, `status`, `document_url`

**Contracts page enhancement:**
- Add a "Drivers" tab showing all drivers with certification status
- Expiration alerts (30/60/90 day warnings)
- Compliance percentage per contractor

**Dashboard integration:**
- Add "Expiring Certifications" alert card

### Phase 4: Aide & Monitor Assignment

**Database migration:**
- New `route_aides` table: `id`, `route_id`, `district_id`, `aide_name`, `aide_type` (aide/monitor), `certification`, `assigned_date`, `status`

**Routes page enhancement:**
- Add aide/monitor column to route table
- Detail dialog shows assigned aides
- Add/remove aide from route detail

### Phase 5: Communication Log

**Database migration:**
- New `communication_log` table: `id`, `district_id`, `contact_type` (parent/school/contractor/other_district), `contact_name`, `direction` (inbound/outbound), `channel` (phone/email/text/in_person), `subject`, `notes`, `related_student_id`, `related_route_id`, `logged_by`, `created_at`

**New page: `/app/communications`** or embedded in relevant pages
- Log calls, emails, and texts with parent/school/contractor
- Link communications to students or routes
- Search and filter by contact, type, date

### Phase 6: Dashboard Overhaul

Redesign the dashboard to serve as the **operational command center** with sections mapping to all 5 workflow areas:

1. **Action Items Banner** - Critical items needing attention (expiring certs, open requests, MV students without transport, expiring contracts, overdue compliance filings)
2. **Secretarial Section** - Open service requests count, recent requests, quick-submit button
3. **Transportation Section** - Route efficiency score, ghost routes, long rides, special ed stats, aide coverage
4. **Business Section** - Contract status, pending invoices, insurance expirations, 19A cert status
5. **Compliance Section** - Audit readiness score, filing deadlines, training completion, Ed Law 2-d status
6. **Quick Actions** - Expanded to include: Add Student, New Request, Generate Bus Pass, Log Communication, Generate Report

### Recommended Implementation Order

1. **Phase 1 (Service Requests)** - Highest impact, covers the entire Secretarial section
2. **Phase 6 (Dashboard Overhaul)** - Makes all data visible from one screen
3. **Phase 2 (Bus Passes & Eligibility)** - Frequently requested by parents
4. **Phase 3 (19A Certifications)** - Legal compliance requirement
5. **Phase 4 (Aides & Monitors)** - Important for special ed compliance
6. **Phase 5 (Communication Log)** - Nice-to-have for audit trails

### Technical Notes

- All new tables will include `district_id` with RLS policies matching the existing pattern (`get_user_district_id()` + `has_app_role()`)
- New sidebar items will be added to `AppLayout.tsx` staffNav array
- Each new page follows the existing pattern: stat cards at top, tabbed or filtered table, detail dialogs
- Seed data will be added for Lawrence UFSD to demonstrate all features

