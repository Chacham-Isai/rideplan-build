
-- =============================================================
-- TASK 1: Demo Sessions table + get_demo_district_id()
-- =============================================================

CREATE TABLE public.demo_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid NOT NULL,
  impersonating_district_id uuid REFERENCES public.districts(id) NOT NULL,
  impersonating_role text NOT NULL DEFAULT 'district_admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage demo sessions
CREATE POLICY "Super admin can select demo_sessions"
  ON public.demo_sessions FOR SELECT
  USING (has_app_role('district_admin'));

CREATE POLICY "Super admin can insert demo_sessions"
  ON public.demo_sessions FOR INSERT
  WITH CHECK (has_app_role('district_admin'));

CREATE POLICY "Super admin can update demo_sessions"
  ON public.demo_sessions FOR UPDATE
  USING (has_app_role('district_admin'));

CREATE POLICY "Super admin can delete demo_sessions"
  ON public.demo_sessions FOR DELETE
  USING (has_app_role('district_admin'));

-- Security definer function: check for active demo session, fallback to real district
CREATE OR REPLACE FUNCTION public.get_demo_district_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT impersonating_district_id FROM public.demo_sessions
     WHERE original_user_id = auth.uid() AND is_active = true
     LIMIT 1),
    (SELECT district_id FROM public.profiles WHERE id = auth.uid())
  )
$$;

-- =============================================================
-- TASK 6: Notifications table
-- =============================================================

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES public.districts(id) NOT NULL,
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  category text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can see their own notifications or broadcast notifications in their district
CREATE POLICY "Users can select own notifications"
  ON public.notifications FOR SELECT
  USING (
    district_id = get_demo_district_id()
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (
    district_id = get_demo_district_id()
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Staff can insert notifications
CREATE POLICY "Staff can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));

-- =============================================================
-- TASK 7: Add AI columns to service_requests
-- =============================================================

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS ai_suggested_priority text,
  ADD COLUMN IF NOT EXISTS ai_suggested_type text;

-- =============================================================
-- TASK 4: Import log table
-- =============================================================

CREATE TABLE public.import_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES public.districts(id) NOT NULL,
  imported_by uuid NOT NULL,
  data_type text NOT NULL,
  file_name text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  imported_rows integer NOT NULL DEFAULT 0,
  skipped_rows integer NOT NULL DEFAULT 0,
  error_rows integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.import_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select import_log"
  ON public.import_log FOR SELECT
  USING (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "Admin can insert import_log"
  ON public.import_log FOR INSERT
  WITH CHECK (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- =============================================================
-- UPDATE RLS: Replace get_user_district_id() with get_demo_district_id()
-- on all major tables for demo impersonation support
-- =============================================================

-- ROUTES
DROP POLICY IF EXISTS "District staff can select routes" ON public.routes;
CREATE POLICY "District staff can select routes" ON public.routes FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert routes" ON public.routes;
CREATE POLICY "District staff can insert routes" ON public.routes FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update routes" ON public.routes;
CREATE POLICY "District staff can update routes" ON public.routes FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete routes" ON public.routes;
CREATE POLICY "District admin can delete routes" ON public.routes FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- ROUTE_STOPS
DROP POLICY IF EXISTS "District staff can select route_stops" ON public.route_stops;
CREATE POLICY "District staff can select route_stops" ON public.route_stops FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert route_stops" ON public.route_stops;
CREATE POLICY "District staff can insert route_stops" ON public.route_stops FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update route_stops" ON public.route_stops;
CREATE POLICY "District staff can update route_stops" ON public.route_stops FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete route_stops" ON public.route_stops;
CREATE POLICY "District admin can delete route_stops" ON public.route_stops FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- CONTRACTS
DROP POLICY IF EXISTS "District staff can select contracts" ON public.contracts;
CREATE POLICY "District staff can select contracts" ON public.contracts FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert contracts" ON public.contracts;
CREATE POLICY "District staff can insert contracts" ON public.contracts FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update contracts" ON public.contracts;
CREATE POLICY "District staff can update contracts" ON public.contracts FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete contracts" ON public.contracts;
CREATE POLICY "District admin can delete contracts" ON public.contracts FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- CONTRACT_INVOICES
DROP POLICY IF EXISTS "District staff can select invoices" ON public.contract_invoices;
CREATE POLICY "District staff can select invoices" ON public.contract_invoices FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert invoices" ON public.contract_invoices;
CREATE POLICY "District staff can insert invoices" ON public.contract_invoices FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update invoices" ON public.contract_invoices;
CREATE POLICY "District staff can update invoices" ON public.contract_invoices FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- CONTRACTOR_PERFORMANCE
DROP POLICY IF EXISTS "District staff can select performance" ON public.contractor_performance;
CREATE POLICY "District staff can select performance" ON public.contractor_performance FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert performance" ON public.contractor_performance;
CREATE POLICY "District staff can insert performance" ON public.contractor_performance FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update performance" ON public.contractor_performance;
CREATE POLICY "District staff can update performance" ON public.contractor_performance FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- CONTRACTOR_INSURANCE
DROP POLICY IF EXISTS "District staff can select insurance" ON public.contractor_insurance;
CREATE POLICY "District staff can select insurance" ON public.contractor_insurance FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert insurance" ON public.contractor_insurance;
CREATE POLICY "District staff can insert insurance" ON public.contractor_insurance FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update insurance" ON public.contractor_insurance;
CREATE POLICY "District staff can update insurance" ON public.contractor_insurance FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- SERVICE_REQUESTS
DROP POLICY IF EXISTS "District staff can select service_requests" ON public.service_requests;
CREATE POLICY "District staff can select service_requests" ON public.service_requests FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert service_requests" ON public.service_requests;
CREATE POLICY "District staff can insert service_requests" ON public.service_requests FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update service_requests" ON public.service_requests;
CREATE POLICY "District staff can update service_requests" ON public.service_requests FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- COMMUNICATION_LOG
DROP POLICY IF EXISTS "District staff can select communication_log" ON public.communication_log;
CREATE POLICY "District staff can select communication_log" ON public.communication_log FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert communication_log" ON public.communication_log;
CREATE POLICY "District staff can insert communication_log" ON public.communication_log FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update communication_log" ON public.communication_log;
CREATE POLICY "District staff can update communication_log" ON public.communication_log FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- COMPLIANCE_REPORTS
DROP POLICY IF EXISTS "District staff can select compliance_reports" ON public.compliance_reports;
CREATE POLICY "District staff can select compliance_reports" ON public.compliance_reports FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert compliance_reports" ON public.compliance_reports;
CREATE POLICY "District staff can insert compliance_reports" ON public.compliance_reports FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update compliance_reports" ON public.compliance_reports;
CREATE POLICY "District staff can update compliance_reports" ON public.compliance_reports FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete compliance_reports" ON public.compliance_reports;
CREATE POLICY "District admin can delete compliance_reports" ON public.compliance_reports FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- COMPLIANCE_TRAINING
DROP POLICY IF EXISTS "District staff can select training" ON public.compliance_training;
CREATE POLICY "District staff can select training" ON public.compliance_training FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert training" ON public.compliance_training;
CREATE POLICY "District staff can insert training" ON public.compliance_training FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update training" ON public.compliance_training;
CREATE POLICY "District staff can update training" ON public.compliance_training FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete training" ON public.compliance_training;
CREATE POLICY "District admin can delete training" ON public.compliance_training FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- DRIVER_CERTIFICATIONS
DROP POLICY IF EXISTS "District staff can select driver_certifications" ON public.driver_certifications;
CREATE POLICY "District staff can select driver_certifications" ON public.driver_certifications FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert driver_certifications" ON public.driver_certifications;
CREATE POLICY "District staff can insert driver_certifications" ON public.driver_certifications FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update driver_certifications" ON public.driver_certifications;
CREATE POLICY "District staff can update driver_certifications" ON public.driver_certifications FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- BUS_PASSES
DROP POLICY IF EXISTS "District staff can select bus_passes" ON public.bus_passes;
CREATE POLICY "District staff can select bus_passes" ON public.bus_passes FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert bus_passes" ON public.bus_passes;
CREATE POLICY "District staff can insert bus_passes" ON public.bus_passes FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update bus_passes" ON public.bus_passes;
CREATE POLICY "District staff can update bus_passes" ON public.bus_passes FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- BIDS
DROP POLICY IF EXISTS "District staff can select bids" ON public.bids;
CREATE POLICY "District staff can select bids" ON public.bids FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert bids" ON public.bids;
CREATE POLICY "District staff can insert bids" ON public.bids FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update bids" ON public.bids;
CREATE POLICY "District staff can update bids" ON public.bids FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete bids" ON public.bids;
CREATE POLICY "District admin can delete bids" ON public.bids FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- BID_RESPONSES
DROP POLICY IF EXISTS "District staff can select bid_responses" ON public.bid_responses;
CREATE POLICY "District staff can select bid_responses" ON public.bid_responses FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert bid_responses" ON public.bid_responses;
CREATE POLICY "District staff can insert bid_responses" ON public.bid_responses FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update bid_responses" ON public.bid_responses;
CREATE POLICY "District staff can update bid_responses" ON public.bid_responses FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- ROUTE_AIDES
DROP POLICY IF EXISTS "District staff can select route_aides" ON public.route_aides;
CREATE POLICY "District staff can select route_aides" ON public.route_aides FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert route_aides" ON public.route_aides;
CREATE POLICY "District staff can insert route_aides" ON public.route_aides FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update route_aides" ON public.route_aides;
CREATE POLICY "District staff can update route_aides" ON public.route_aides FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete route_aides" ON public.route_aides;
CREATE POLICY "District admin can delete route_aides" ON public.route_aides FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- ROUTE_SCENARIOS
DROP POLICY IF EXISTS "District staff can select scenarios" ON public.route_scenarios;
CREATE POLICY "District staff can select scenarios" ON public.route_scenarios FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert scenarios" ON public.route_scenarios;
CREATE POLICY "District staff can insert scenarios" ON public.route_scenarios FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update scenarios" ON public.route_scenarios;
CREATE POLICY "District staff can update scenarios" ON public.route_scenarios FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete scenarios" ON public.route_scenarios;
CREATE POLICY "District admin can delete scenarios" ON public.route_scenarios FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- ED_LAW_2D_CONTRACTORS
DROP POLICY IF EXISTS "District staff can select ed_law_2d" ON public.ed_law_2d_contractors;
CREATE POLICY "District staff can select ed_law_2d" ON public.ed_law_2d_contractors FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert ed_law_2d" ON public.ed_law_2d_contractors;
CREATE POLICY "District staff can insert ed_law_2d" ON public.ed_law_2d_contractors FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update ed_law_2d" ON public.ed_law_2d_contractors;
CREATE POLICY "District staff can update ed_law_2d" ON public.ed_law_2d_contractors FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete ed_law_2d" ON public.ed_law_2d_contractors;
CREATE POLICY "District admin can delete ed_law_2d" ON public.ed_law_2d_contractors FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- MCKINNEY_VENTO_STUDENTS
DROP POLICY IF EXISTS "District staff can select mv_students" ON public.mckinney_vento_students;
CREATE POLICY "District staff can select mv_students" ON public.mckinney_vento_students FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert mv_students" ON public.mckinney_vento_students;
CREATE POLICY "District staff can insert mv_students" ON public.mckinney_vento_students FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update mv_students" ON public.mckinney_vento_students;
CREATE POLICY "District staff can update mv_students" ON public.mckinney_vento_students FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District admin can delete mv_students" ON public.mckinney_vento_students;
CREATE POLICY "District admin can delete mv_students" ON public.mckinney_vento_students FOR DELETE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- ELIGIBILITY_RULES
DROP POLICY IF EXISTS "District admin can manage eligibility_rules" ON public.eligibility_rules;
CREATE POLICY "District admin can manage eligibility_rules" ON public.eligibility_rules FOR ALL USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));
DROP POLICY IF EXISTS "District staff can select eligibility_rules" ON public.eligibility_rules;
CREATE POLICY "District staff can select eligibility_rules" ON public.eligibility_rules FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- SAFETY_REPORTS
DROP POLICY IF EXISTS "District staff can select safety_reports" ON public.safety_reports;
CREATE POLICY "District staff can select safety_reports" ON public.safety_reports FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can insert safety_reports" ON public.safety_reports;
CREATE POLICY "District staff can insert safety_reports" ON public.safety_reports FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update safety_reports" ON public.safety_reports;
CREATE POLICY "District staff can update safety_reports" ON public.safety_reports FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- DRIVER_REPORTS (only district-scoped ones)
DROP POLICY IF EXISTS "District staff can select driver_reports" ON public.driver_reports;
CREATE POLICY "District staff can select driver_reports" ON public.driver_reports FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update driver_reports" ON public.driver_reports;
CREATE POLICY "District staff can update driver_reports" ON public.driver_reports FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));

-- DISTRICT_USER_ROLES (admin policies)
DROP POLICY IF EXISTS "District admins can view district roles" ON public.district_user_roles;
CREATE POLICY "District admins can view district roles" ON public.district_user_roles FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));
DROP POLICY IF EXISTS "District admins can insert district roles" ON public.district_user_roles;
CREATE POLICY "District admins can insert district roles" ON public.district_user_roles FOR INSERT WITH CHECK ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));
DROP POLICY IF EXISTS "District admins can update district roles" ON public.district_user_roles;
CREATE POLICY "District admins can update district roles" ON public.district_user_roles FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- DISTRICTS (view own district — update to use demo)
DROP POLICY IF EXISTS "Users can view own district" ON public.districts;
CREATE POLICY "Users can view own district" ON public.districts FOR SELECT USING (id = get_demo_district_id());

-- PROFILES (admin view)
DROP POLICY IF EXISTS "District admins can view district profiles" ON public.profiles;
CREATE POLICY "District admins can view district profiles" ON public.profiles FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('district_admin'));

-- STUDENT_REGISTRATIONS (staff policies)
DROP POLICY IF EXISTS "District staff can select registrations" ON public.student_registrations;
CREATE POLICY "District staff can select registrations" ON public.student_registrations FOR SELECT USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
DROP POLICY IF EXISTS "District staff can update registrations" ON public.student_registrations;
CREATE POLICY "District staff can update registrations" ON public.student_registrations FOR UPDATE USING ((district_id = get_demo_district_id()) AND has_app_role('staff'));
