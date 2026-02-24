
-- Compliance Reports (BEDS/STAC filings)
CREATE TABLE public.compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  school_year TEXT NOT NULL,
  filing_deadline DATE,
  filed_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  student_count INTEGER DEFAULT 0,
  route_count INTEGER DEFAULT 0,
  total_expenditure NUMERIC DEFAULT 0,
  state_aid_claimed NUMERIC DEFAULT 0,
  notes TEXT,
  document_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select compliance_reports" ON public.compliance_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert compliance_reports" ON public.compliance_reports FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update compliance_reports" ON public.compliance_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete compliance_reports" ON public.compliance_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- McKinney-Vento Students
CREATE TABLE public.mckinney_vento_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  living_situation TEXT NOT NULL DEFAULT 'doubled_up',
  school_of_origin TEXT,
  current_address TEXT,
  transportation_provided BOOLEAN DEFAULT false,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  liaison_contact TEXT,
  enrollment_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mckinney_vento_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select mv_students" ON public.mckinney_vento_students FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert mv_students" ON public.mckinney_vento_students FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update mv_students" ON public.mckinney_vento_students FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete mv_students" ON public.mckinney_vento_students FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Ed Law 2-d Contractors
CREATE TABLE public.ed_law_2d_contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  contractor_name TEXT NOT NULL,
  data_access_level TEXT NOT NULL DEFAULT 'none',
  agreement_signed BOOLEAN DEFAULT false,
  agreement_date DATE,
  annual_review_date DATE,
  parents_notified BOOLEAN DEFAULT false,
  encryption_verified BOOLEAN DEFAULT false,
  breach_plan_filed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ed_law_2d_contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select ed_law_2d" ON public.ed_law_2d_contractors FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert ed_law_2d" ON public.ed_law_2d_contractors FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ed_law_2d" ON public.ed_law_2d_contractors FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ed_law_2d" ON public.ed_law_2d_contractors FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Compliance Training
CREATE TABLE public.compliance_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_type TEXT NOT NULL,
  title TEXT NOT NULL,
  required_for TEXT NOT NULL DEFAULT 'all_staff',
  due_date DATE,
  completed_count INTEGER DEFAULT 0,
  total_required INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select training" ON public.compliance_training FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert training" ON public.compliance_training FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update training" ON public.compliance_training FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete training" ON public.compliance_training FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Breach Incidents
CREATE TABLE public.breach_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_date DATE NOT NULL,
  discovered_date DATE NOT NULL,
  contractor_id UUID REFERENCES public.ed_law_2d_contractors(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  data_types_affected TEXT,
  students_affected INTEGER DEFAULT 0,
  notification_sent BOOLEAN DEFAULT false,
  notification_date DATE,
  remediation_steps TEXT,
  status TEXT NOT NULL DEFAULT 'investigating',
  severity TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.breach_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select breaches" ON public.breach_incidents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert breaches" ON public.breach_incidents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update breaches" ON public.breach_incidents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete breaches" ON public.breach_incidents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
