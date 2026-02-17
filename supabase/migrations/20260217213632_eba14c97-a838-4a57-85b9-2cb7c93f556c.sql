
-- Enums
CREATE TYPE public.safety_report_type AS ENUM ('bullying', 'driver_safety', 'other');
CREATE TYPE public.report_status AS ENUM ('new', 'reviewing', 'resolved');
CREATE TYPE public.ai_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.driver_report_type AS ENUM ('incident', 'maintenance', 'schedule', 'other');

-- Safety reports
CREATE TABLE public.safety_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_type public.safety_report_type NOT NULL,
  school_name TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reporter_phone TEXT,
  status public.report_status NOT NULL DEFAULT 'new',
  ai_priority public.ai_priority NOT NULL DEFAULT 'low'
);
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a safety report" ON public.safety_reports FOR INSERT WITH CHECK (true);

-- Driver reports
CREATE TABLE public.driver_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_type public.driver_report_type NOT NULL,
  driver_name TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  route_info TEXT,
  description TEXT NOT NULL,
  contact_info TEXT,
  status public.report_status NOT NULL DEFAULT 'new'
);
ALTER TABLE public.driver_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a driver report" ON public.driver_reports FOR INSERT WITH CHECK (true);

-- Driver tips
CREATE TABLE public.driver_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bus_number TEXT,
  driver_name TEXT,
  tip_amount NUMERIC NOT NULL,
  message TEXT,
  tipper_name TEXT NOT NULL,
  tipper_email TEXT NOT NULL
);
ALTER TABLE public.driver_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a tip" ON public.driver_tips FOR INSERT WITH CHECK (true);

-- Report alerts (backend only, no public access)
CREATE TABLE public.report_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  alert_type TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 1,
  details TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.report_alerts ENABLE ROW LEVEL SECURITY;
