
-- =============================================
-- PHASE 1: Service Requests
-- =============================================
CREATE TYPE public.service_request_type AS ENUM (
  'stop_change', 'address_change', 'school_change', 
  'driver_issue', 'general_inquiry', 'bus_pass'
);

CREATE TYPE public.service_request_status AS ENUM (
  'open', 'in_progress', 'resolved', 'closed'
);

CREATE TYPE public.service_request_priority AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  parent_user_id UUID,
  request_type public.service_request_type NOT NULL DEFAULT 'general_inquiry',
  student_registration_id UUID REFERENCES public.student_registrations(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  current_value TEXT,
  requested_value TEXT,
  priority public.service_request_priority NOT NULL DEFAULT 'medium',
  status public.service_request_status NOT NULL DEFAULT 'open',
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select service_requests" ON public.service_requests
  FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can update service_requests" ON public.service_requests
  FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can insert service_requests" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "Parents can insert own service_requests" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Parents can view own service_requests" ON public.service_requests
  FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid());

CREATE TABLE public.service_request_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_request_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select request_notes" ON public.service_request_notes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.service_requests sr 
    WHERE sr.id = service_request_notes.request_id 
    AND sr.district_id = get_user_district_id()
  ) AND has_app_role('staff'));

CREATE POLICY "District staff can insert request_notes" ON public.service_request_notes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.service_requests sr 
    WHERE sr.id = service_request_notes.request_id 
    AND sr.district_id = get_user_district_id()
  ) AND has_app_role('staff'));

CREATE POLICY "Parents can view own request_notes" ON public.service_request_notes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.service_requests sr 
    WHERE sr.id = service_request_notes.request_id 
    AND sr.parent_user_id = auth.uid()
  ));

-- =============================================
-- PHASE 2: Bus Passes & Eligibility
-- =============================================
CREATE TYPE public.bus_pass_status AS ENUM ('active', 'expired', 'revoked');

CREATE TABLE public.bus_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.student_registrations(id),
  district_id UUID NOT NULL REFERENCES public.districts(id),
  pass_number TEXT NOT NULL,
  school_year TEXT NOT NULL,
  status public.bus_pass_status NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.bus_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select bus_passes" ON public.bus_passes
  FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can insert bus_passes" ON public.bus_passes
  FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can update bus_passes" ON public.bus_passes
  FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE TABLE public.eligibility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  grade_range_start TEXT NOT NULL DEFAULT 'K',
  grade_range_end TEXT NOT NULL DEFAULT '12',
  min_distance_miles NUMERIC NOT NULL DEFAULT 1.5,
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select eligibility_rules" ON public.eligibility_rules
  FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District admin can manage eligibility_rules" ON public.eligibility_rules
  FOR ALL TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- =============================================
-- PHASE 3: Driver Certifications (19A)
-- =============================================
CREATE TYPE public.certification_type AS ENUM (
  '19a_initial', '19a_biennial', 'cdl', 'medical'
);

CREATE TYPE public.certification_status AS ENUM (
  'valid', 'expiring', 'expired', 'pending'
);

CREATE TABLE public.driver_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  driver_name TEXT NOT NULL,
  contractor_id UUID REFERENCES public.contracts(id),
  certification_type public.certification_type NOT NULL,
  issued_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  status public.certification_status NOT NULL DEFAULT 'valid',
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select driver_certifications" ON public.driver_certifications
  FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can insert driver_certifications" ON public.driver_certifications
  FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can update driver_certifications" ON public.driver_certifications
  FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

-- =============================================
-- PHASE 4: Route Aides & Monitors
-- =============================================
CREATE TYPE public.aide_type AS ENUM ('aide', 'monitor');
CREATE TYPE public.aide_status AS ENUM ('active', 'inactive');

CREATE TABLE public.route_aides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id),
  district_id UUID NOT NULL REFERENCES public.districts(id),
  aide_name TEXT NOT NULL,
  aide_type public.aide_type NOT NULL DEFAULT 'aide',
  certification TEXT,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.aide_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.route_aides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select route_aides" ON public.route_aides
  FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can insert route_aides" ON public.route_aides
  FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can update route_aides" ON public.route_aides
  FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District admin can delete route_aides" ON public.route_aides
  FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- =============================================
-- PHASE 5: Communication Log
-- =============================================
CREATE TYPE public.comm_contact_type AS ENUM (
  'parent', 'school', 'contractor', 'other_district'
);

CREATE TYPE public.comm_direction AS ENUM ('inbound', 'outbound');

CREATE TYPE public.comm_channel AS ENUM (
  'phone', 'email', 'text', 'in_person'
);

CREATE TABLE public.communication_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  contact_type public.comm_contact_type NOT NULL DEFAULT 'parent',
  contact_name TEXT NOT NULL,
  direction public.comm_direction NOT NULL DEFAULT 'inbound',
  channel public.comm_channel NOT NULL DEFAULT 'phone',
  subject TEXT NOT NULL DEFAULT '',
  notes TEXT,
  related_student_id UUID REFERENCES public.student_registrations(id),
  related_route_id UUID REFERENCES public.routes(id),
  logged_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "District staff can select communication_log" ON public.communication_log
  FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can insert communication_log" ON public.communication_log
  FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can update communication_log" ON public.communication_log
  FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
