

# School Calendar & Schedule Management System

## Overview

This feature adds a full school calendar module to the platform, enabling districts to manage legal holidays, non-public school days (religious observances, staff development), bell schedules per school, and schedule changes (early dismissals, delays, cancellations). Routes and parent notifications tie into calendar events so transportation adjusts automatically.

## Database Schema

Three new tables:

```text
school_calendar_events
├── id (uuid, PK)
├── district_id (uuid, FK → districts)
├── title (text) — e.g. "Martin Luther King Jr. Day"
├── event_date (date)
├── end_date (date, nullable) — for multi-day events like spring break
├── event_type (text) — 'legal_holiday' | 'religious_observance' | 'staff_development' | 'early_dismissal' | 'delay' | 'cancellation' | 'half_day' | 'custom'
├── applies_to (text) — 'all' | 'public_only' | 'non_public_only' | specific school name
├── notes (text, nullable)
├── dismissal_time (time, nullable) — for early dismissals
├── delay_minutes (integer, nullable) — for delays
├── school_year (text) — '2025-2026'
├── created_by (uuid)
├── created_at (timestamptz)

bell_schedules
├── id (uuid, PK)
├── district_id (uuid, FK → districts)
├── school (text)
├── schedule_name (text) — 'Regular' | 'Half Day' | 'Delayed Opening'
├── am_start (time)
├── am_end (time)
├── pm_start (time)
├── pm_end (time)
├── is_default (boolean)
├── school_year (text)
├── created_at (timestamptz)

schedule_overrides
├── id (uuid, PK)
├── district_id (uuid, FK → districts)
├── calendar_event_id (uuid, FK → school_calendar_events, nullable)
├── school (text)
├── override_date (date)
├── bell_schedule_id (uuid, FK → bell_schedules, nullable) — which bell schedule to use
├── no_transport (boolean) — true = buses don't run
├── notes (text, nullable)
├── created_at (timestamptz)
```

RLS policies follow the existing pattern: `district_id = get_demo_district_id()` with `has_app_role('staff')` for read/write, `has_app_role('district_admin')` for delete.

## Frontend Components

### 1. New Calendar Page (`src/pages/app/SchoolCalendar.tsx`)

Tabs: **Calendar View** | **Bell Schedules** | **Schedule Overrides**

**Calendar View tab:**
- Month-view calendar grid (custom built with `date-fns`, no new dependency)
- Days color-coded: red = no school, orange = early dismissal/delay, blue = half day
- Click a day to see events or add one
- Sidebar list of upcoming events
- "Add Event" dialog with fields for title, date range, event type, applies_to, dismissal time, delay minutes, notes
- Bulk import: pre-populate NY legal holidays for the school year (MLK Day, Presidents Day, Memorial Day, Juneteenth, July 4th, Labor Day, Columbus Day, Veterans Day, Thanksgiving + day after, Christmas, New Year's)

**Bell Schedules tab:**
- Table of bell schedules per school
- Add/edit dialog: school, schedule name, AM/PM start/end times, mark as default
- Shows which schedule is active today based on overrides

**Schedule Overrides tab:**
- Table of date-specific overrides (e.g., "Dec 23 — Half Day schedule at Lawrence HS")
- Link overrides to calendar events
- Toggle "No Transport" flag per override

### 2. Dashboard Integration

- Add an "Upcoming Calendar" card to the Dashboard showing next 5 non-school days or schedule changes
- Show a yellow banner at top of Dashboard when today has a schedule override active

### 3. Route Integration

- On the Routes page, show a small indicator when the current day has a schedule change affecting routes
- Parent Dashboard shows next non-school day

### 4. Navigation

- Add "Calendar" link in the app sidebar navigation (between Routes and Compliance, or similar)

## Technical Details

- **Migration**: Single SQL migration creating all 3 tables, RLS policies, and realtime publication for `school_calendar_events`
- **NY Holiday Seeder**: A client-side function generates standard NY legal holidays for a given school year and bulk-inserts them
- **No new dependencies**: Calendar grid built with `date-fns` (already installed) and Tailwind grid classes
- **Month navigation**: Simple state with `addMonths`/`subMonths` from date-fns
- **Event types** stored as plain text (not enum) for flexibility

## Implementation Steps

1. Database migration: create `school_calendar_events`, `bell_schedules`, `schedule_overrides` tables with RLS
2. Build `SchoolCalendar.tsx` page with calendar grid, event CRUD, and bell schedule management
3. Add route to app navigation and `AppLayout.tsx` sidebar
4. Add Dashboard calendar card and today-override banner
5. Seed NY legal holidays function

## Seed Data

Pre-populate for demo districts (Lawrence, Oceanside) for 2025-2026:
- 12+ NY legal holidays
- 3-4 non-public school days (Rosh Hashanah, Yom Kippur, Good Friday)
- 2-3 staff development days
- Sample bell schedules (Regular, Half Day, 2-Hour Delay) per school

