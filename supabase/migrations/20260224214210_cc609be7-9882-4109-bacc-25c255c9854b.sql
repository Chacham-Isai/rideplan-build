
-- Enums for registration system
CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'denied', 'under_review');
CREATE TYPE public.childcare_transport_type AS ENUM ('am', 'pm', 'both');

-- Student registrations table
CREATE TABLE public.student_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  dob DATE NOT NULL,
  grade TEXT NOT NULL,
  school TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NY',
  zip TEXT NOT NULL,
  geocoded_lat NUMERIC,
  geocoded_lng NUMERIC,
  district_boundary_check BOOLEAN DEFAULT false,
  distance_to_school NUMERIC,
  iep_flag BOOLEAN DEFAULT false,
  mckinney_vento_flag BOOLEAN DEFAULT false,
  section_504_flag BOOLEAN DEFAULT false,
  foster_care_flag BOOLEAN DEFAULT false,
  status registration_status NOT NULL DEFAULT 'pending',
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own registrations"
  ON public.student_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can insert own registrations"
  ON public.student_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update own pending registrations"
  ON public.student_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = parent_user_id AND status = 'pending');

CREATE POLICY "Admins can view all registrations"
  ON public.student_registrations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all registrations"
  ON public.student_registrations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Residency documents table
CREATE TABLE public.residency_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.residency_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own documents"
  ON public.residency_documents FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_registrations sr
    WHERE sr.id = registration_id AND sr.parent_user_id = auth.uid()
  ));

CREATE POLICY "Parents can insert own documents"
  ON public.residency_documents FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.student_registrations sr
    WHERE sr.id = registration_id AND sr.parent_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all documents"
  ON public.residency_documents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Residency attestations table
CREATE TABLE public.residency_attestations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL,
  attestation_text TEXT NOT NULL,
  signature_text TEXT NOT NULL,
  ip_address TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.residency_attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own attestations"
  ON public.residency_attestations FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can insert own attestations"
  ON public.residency_attestations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Admins can view all attestations"
  ON public.residency_attestations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Childcare requests table
CREATE TABLE public.childcare_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_address TEXT NOT NULL,
  within_district BOOLEAN DEFAULT false,
  days_needed TEXT[] NOT NULL DEFAULT '{}',
  transport_type childcare_transport_type NOT NULL DEFAULT 'both',
  status registration_status NOT NULL DEFAULT 'pending',
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.childcare_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own childcare requests"
  ON public.childcare_requests FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.student_registrations sr
    WHERE sr.id = registration_id AND sr.parent_user_id = auth.uid()
  ));

CREATE POLICY "Parents can insert own childcare requests"
  ON public.childcare_requests FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.student_registrations sr
    WHERE sr.id = registration_id AND sr.parent_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all childcare requests"
  ON public.childcare_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update childcare requests"
  ON public.childcare_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger for student_registrations
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_student_registrations_updated_at
  BEFORE UPDATE ON public.student_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for residency documents
INSERT INTO storage.buckets (id, name, public) VALUES ('residency-documents', 'residency-documents', false);

-- Storage RLS: parents can upload to their own folder
CREATE POLICY "Parents can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'residency-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Parents can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'residency-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all residency documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'residency-documents' AND public.has_role(auth.uid(), 'admin'));
