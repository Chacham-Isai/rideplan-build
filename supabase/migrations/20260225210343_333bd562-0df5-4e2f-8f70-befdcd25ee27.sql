
-- Field trip scheduling table
CREATE TABLE public.field_trips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  trip_name text NOT NULL,
  destination text NOT NULL,
  school text NOT NULL,
  grade_level text,
  departure_date date NOT NULL,
  departure_time time NOT NULL DEFAULT '08:00',
  return_time time NOT NULL DEFAULT '15:00',
  bus_number text,
  driver_name text,
  student_count integer DEFAULT 0,
  chaperone_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.field_trips ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can select field_trips" ON public.field_trips
  FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "Staff can insert field_trips" ON public.field_trips
  FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "Staff can update field_trips" ON public.field_trips
  FOR UPDATE USING (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "Admin can delete field_trips" ON public.field_trips
  FOR DELETE USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));
