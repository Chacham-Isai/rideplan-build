
-- ============================================================
-- MULTI-TENANT DISTRICT ISOLATION
-- Add district_id to 13 tables, backfill Lawrence, new RLS
-- ============================================================

DO $$
DECLARE
  lawrence_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
  -- ---- 1. ADD district_id COLUMNS (nullable first) ----
  ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.contract_invoices ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.contractor_insurance ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.contractor_performance ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.compliance_reports ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.compliance_training ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.mckinney_vento_students ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.ed_law_2d_contractors ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.safety_reports ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.route_stops ADD COLUMN IF NOT EXISTS district_id UUID;
  ALTER TABLE public.route_scenarios ADD COLUMN IF NOT EXISTS district_id UUID;

  -- ---- 2. BACKFILL all existing rows to Lawrence ----
  UPDATE public.routes SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.student_registrations SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.contracts SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.contract_invoices SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.contractor_insurance SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.contractor_performance SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.compliance_reports SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.compliance_training SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.mckinney_vento_students SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.ed_law_2d_contractors SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.safety_reports SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.route_stops SET district_id = lawrence_id WHERE district_id IS NULL;
  UPDATE public.route_scenarios SET district_id = lawrence_id WHERE district_id IS NULL;

  -- ---- 3. SET NOT NULL + FK ----
  ALTER TABLE public.routes ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.routes ADD CONSTRAINT routes_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.student_registrations ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.student_registrations ADD CONSTRAINT student_registrations_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.contracts ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.contracts ADD CONSTRAINT contracts_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.contract_invoices ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.contract_invoices ADD CONSTRAINT contract_invoices_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.contractor_insurance ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.contractor_insurance ADD CONSTRAINT contractor_insurance_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.contractor_performance ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.contractor_performance ADD CONSTRAINT contractor_performance_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.compliance_reports ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.compliance_reports ADD CONSTRAINT compliance_reports_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.compliance_training ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.compliance_training ADD CONSTRAINT compliance_training_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.mckinney_vento_students ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.mckinney_vento_students ADD CONSTRAINT mckinney_vento_students_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.ed_law_2d_contractors ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.ed_law_2d_contractors ADD CONSTRAINT ed_law_2d_contractors_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.safety_reports ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.safety_reports ADD CONSTRAINT safety_reports_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.route_stops ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.route_stops ADD CONSTRAINT route_stops_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);

  ALTER TABLE public.route_scenarios ALTER COLUMN district_id SET NOT NULL;
  ALTER TABLE public.route_scenarios ADD CONSTRAINT route_scenarios_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);
END $$;

-- ============================================================
-- 4. DROP OLD has_role() RLS POLICIES
-- ============================================================

-- routes
DROP POLICY IF EXISTS "Admins can select routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can insert routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can update routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can delete routes" ON public.routes;

-- contracts
DROP POLICY IF EXISTS "Admins can select contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can update contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can delete contracts" ON public.contracts;

-- contract_invoices
DROP POLICY IF EXISTS "Admins can select invoices" ON public.contract_invoices;
DROP POLICY IF EXISTS "Admins can insert invoices" ON public.contract_invoices;
DROP POLICY IF EXISTS "Admins can update invoices" ON public.contract_invoices;

-- contractor_insurance
DROP POLICY IF EXISTS "Admins can select insurance" ON public.contractor_insurance;
DROP POLICY IF EXISTS "Admins can insert insurance" ON public.contractor_insurance;
DROP POLICY IF EXISTS "Admins can update insurance" ON public.contractor_insurance;

-- contractor_performance
DROP POLICY IF EXISTS "Admins can select performance" ON public.contractor_performance;
DROP POLICY IF EXISTS "Admins can insert performance" ON public.contractor_performance;
DROP POLICY IF EXISTS "Admins can update performance" ON public.contractor_performance;

-- compliance_reports
DROP POLICY IF EXISTS "Admins can select compliance_reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Admins can insert compliance_reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Admins can update compliance_reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Admins can delete compliance_reports" ON public.compliance_reports;

-- compliance_training
DROP POLICY IF EXISTS "Admins can select training" ON public.compliance_training;
DROP POLICY IF EXISTS "Admins can insert training" ON public.compliance_training;
DROP POLICY IF EXISTS "Admins can update training" ON public.compliance_training;
DROP POLICY IF EXISTS "Admins can delete training" ON public.compliance_training;

-- mckinney_vento_students
DROP POLICY IF EXISTS "Admins can select mv_students" ON public.mckinney_vento_students;
DROP POLICY IF EXISTS "Admins can insert mv_students" ON public.mckinney_vento_students;
DROP POLICY IF EXISTS "Admins can update mv_students" ON public.mckinney_vento_students;
DROP POLICY IF EXISTS "Admins can delete mv_students" ON public.mckinney_vento_students;

-- ed_law_2d_contractors
DROP POLICY IF EXISTS "Admins can select ed_law_2d" ON public.ed_law_2d_contractors;
DROP POLICY IF EXISTS "Admins can insert ed_law_2d" ON public.ed_law_2d_contractors;
DROP POLICY IF EXISTS "Admins can update ed_law_2d" ON public.ed_law_2d_contractors;
DROP POLICY IF EXISTS "Admins can delete ed_law_2d" ON public.ed_law_2d_contractors;

-- safety_reports (keep public insert, drop admin select/update)
DROP POLICY IF EXISTS "Admins can view safety reports" ON public.safety_reports;
DROP POLICY IF EXISTS "Admins can update safety reports" ON public.safety_reports;
-- Keep: "Anyone can submit a safety report"

-- route_stops
DROP POLICY IF EXISTS "Admins can select route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Admins can insert route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Admins can update route_stops" ON public.route_stops;
DROP POLICY IF EXISTS "Admins can delete route_stops" ON public.route_stops;

-- route_scenarios
DROP POLICY IF EXISTS "Admins can select scenarios" ON public.route_scenarios;
DROP POLICY IF EXISTS "Admins can insert scenarios" ON public.route_scenarios;
DROP POLICY IF EXISTS "Admins can update scenarios" ON public.route_scenarios;
DROP POLICY IF EXISTS "Admins can delete scenarios" ON public.route_scenarios;

-- student_registrations (drop old admin policies, keep parent policies)
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.student_registrations;
DROP POLICY IF EXISTS "Admins can update all registrations" ON public.student_registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.student_registrations;
-- Keep: "Parents can insert own registrations", "Parents can view own registrations", "Parents can update own pending registrations"

-- ============================================================
-- 5. CREATE NEW DISTRICT-SCOPED RLS POLICIES
-- ============================================================

-- Helper macro: for most tables the pattern is identical
-- ROUTES
CREATE POLICY "District staff can select routes" ON public.routes FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert routes" ON public.routes FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update routes" ON public.routes FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete routes" ON public.routes FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- CONTRACTS
CREATE POLICY "District staff can select contracts" ON public.contracts FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert contracts" ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update contracts" ON public.contracts FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete contracts" ON public.contracts FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- CONTRACT_INVOICES
CREATE POLICY "District staff can select invoices" ON public.contract_invoices FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert invoices" ON public.contract_invoices FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update invoices" ON public.contract_invoices FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

-- CONTRACTOR_INSURANCE
CREATE POLICY "District staff can select insurance" ON public.contractor_insurance FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert insurance" ON public.contractor_insurance FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update insurance" ON public.contractor_insurance FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

-- CONTRACTOR_PERFORMANCE
CREATE POLICY "District staff can select performance" ON public.contractor_performance FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert performance" ON public.contractor_performance FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update performance" ON public.contractor_performance FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

-- COMPLIANCE_REPORTS
CREATE POLICY "District staff can select compliance_reports" ON public.compliance_reports FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert compliance_reports" ON public.compliance_reports FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update compliance_reports" ON public.compliance_reports FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete compliance_reports" ON public.compliance_reports FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- COMPLIANCE_TRAINING
CREATE POLICY "District staff can select training" ON public.compliance_training FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert training" ON public.compliance_training FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update training" ON public.compliance_training FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete training" ON public.compliance_training FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- MCKINNEY_VENTO_STUDENTS
CREATE POLICY "District staff can select mv_students" ON public.mckinney_vento_students FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert mv_students" ON public.mckinney_vento_students FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update mv_students" ON public.mckinney_vento_students FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete mv_students" ON public.mckinney_vento_students FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- ED_LAW_2D_CONTRACTORS
CREATE POLICY "District staff can select ed_law_2d" ON public.ed_law_2d_contractors FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert ed_law_2d" ON public.ed_law_2d_contractors FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update ed_law_2d" ON public.ed_law_2d_contractors FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete ed_law_2d" ON public.ed_law_2d_contractors FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- SAFETY_REPORTS (keep public insert, add district-scoped select/update)
CREATE POLICY "District staff can select safety_reports" ON public.safety_reports FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update safety_reports" ON public.safety_reports FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));

-- ROUTE_STOPS
CREATE POLICY "District staff can select route_stops" ON public.route_stops FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert route_stops" ON public.route_stops FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update route_stops" ON public.route_stops FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete route_stops" ON public.route_stops FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- ROUTE_SCENARIOS
CREATE POLICY "District staff can select scenarios" ON public.route_scenarios FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert scenarios" ON public.route_scenarios FOR INSERT TO authenticated
  WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update scenarios" ON public.route_scenarios FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete scenarios" ON public.route_scenarios FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- STUDENT_REGISTRATIONS (add district-scoped staff policies alongside existing parent policies)
CREATE POLICY "District staff can select registrations" ON public.student_registrations FOR SELECT TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update registrations" ON public.student_registrations FOR UPDATE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete registrations" ON public.student_registrations FOR DELETE TO authenticated
  USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- ============================================================
-- 6. ADD INDEXES for RLS performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_routes_district_id ON public.routes(district_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_district_id ON public.student_registrations(district_id);
CREATE INDEX IF NOT EXISTS idx_contracts_district_id ON public.contracts(district_id);
CREATE INDEX IF NOT EXISTS idx_contract_invoices_district_id ON public.contract_invoices(district_id);
CREATE INDEX IF NOT EXISTS idx_contractor_insurance_district_id ON public.contractor_insurance(district_id);
CREATE INDEX IF NOT EXISTS idx_contractor_performance_district_id ON public.contractor_performance(district_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_district_id ON public.compliance_reports(district_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_district_id ON public.compliance_training(district_id);
CREATE INDEX IF NOT EXISTS idx_mckinney_vento_district_id ON public.mckinney_vento_students(district_id);
CREATE INDEX IF NOT EXISTS idx_ed_law_2d_district_id ON public.ed_law_2d_contractors(district_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_district_id ON public.safety_reports(district_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_district_id ON public.route_stops(district_id);
CREATE INDEX IF NOT EXISTS idx_route_scenarios_district_id ON public.route_scenarios(district_id);
