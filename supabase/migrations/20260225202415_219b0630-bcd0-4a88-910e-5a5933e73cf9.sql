
-- school_calendar_events
CREATE TABLE public.school_calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  title text NOT NULL,
  event_date date NOT NULL,
  end_date date,
  event_type text NOT NULL DEFAULT 'custom',
  applies_to text NOT NULL DEFAULT 'all',
  notes text,
  dismissal_time time,
  delay_minutes integer,
  school_year text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select calendar events" ON public.school_calendar_events
  FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can insert calendar events" ON public.school_calendar_events
  FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can update calendar events" ON public.school_calendar_events
  FOR UPDATE USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Admin can delete calendar events" ON public.school_calendar_events
  FOR DELETE USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- bell_schedules
CREATE TABLE public.bell_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  school text NOT NULL,
  schedule_name text NOT NULL,
  am_start time NOT NULL,
  am_end time NOT NULL,
  pm_start time NOT NULL,
  pm_end time NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  school_year text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bell_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select bell schedules" ON public.bell_schedules
  FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can insert bell schedules" ON public.bell_schedules
  FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can update bell schedules" ON public.bell_schedules
  FOR UPDATE USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Admin can delete bell schedules" ON public.bell_schedules
  FOR DELETE USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- schedule_overrides
CREATE TABLE public.schedule_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  calendar_event_id uuid REFERENCES public.school_calendar_events(id),
  school text NOT NULL,
  override_date date NOT NULL,
  bell_schedule_id uuid REFERENCES public.bell_schedules(id),
  no_transport boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select schedule overrides" ON public.schedule_overrides
  FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can insert schedule overrides" ON public.schedule_overrides
  FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can update schedule overrides" ON public.schedule_overrides
  FOR UPDATE USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Admin can delete schedule overrides" ON public.schedule_overrides
  FOR DELETE USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- Enable realtime for calendar events
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_calendar_events;
