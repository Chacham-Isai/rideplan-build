
-- Routes
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_number TEXT NOT NULL,
  school TEXT NOT NULL,
  contractor_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  bus_number TEXT,
  driver_name TEXT,
  tier INTEGER NOT NULL DEFAULT 1,
  am_start TIME,
  am_end TIME,
  pm_start TIME,
  pm_end TIME,
  total_miles NUMERIC DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 72,
  avg_ride_time_min NUMERIC DEFAULT 0,
  on_time_pct NUMERIC DEFAULT 100,
  cost_per_student NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select routes" ON public.routes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert routes" ON public.routes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON public.routes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete routes" ON public.routes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Route Stops
CREATE TABLE public.route_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL DEFAULT 0,
  stop_name TEXT NOT NULL,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  students_boarding INTEGER DEFAULT 0,
  students_alighting INTEGER DEFAULT 0,
  scheduled_time TIME,
  avg_actual_time TIME,
  dwell_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select route_stops" ON public.route_stops FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert route_stops" ON public.route_stops FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update route_stops" ON public.route_stops FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete route_stops" ON public.route_stops FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Route Scenarios (consolidation simulator / bell time modeling)
CREATE TABLE public.route_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  scenario_type TEXT NOT NULL DEFAULT 'consolidation',
  description TEXT,
  parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  estimated_savings NUMERIC DEFAULT 0,
  routes_affected INTEGER DEFAULT 0,
  students_affected INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.route_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select scenarios" ON public.route_scenarios FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert scenarios" ON public.route_scenarios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update scenarios" ON public.route_scenarios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete scenarios" ON public.route_scenarios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
