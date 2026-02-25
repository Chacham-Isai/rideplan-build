
-- Accident Reports
CREATE TABLE public.accident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES public.districts(id),
  bus_number text NOT NULL,
  incident_date date NOT NULL,
  incident_time time without time zone,
  location text,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'minor',
  injuries_reported boolean NOT NULL DEFAULT false,
  police_report_number text,
  driver_name text,
  weather_conditions text,
  road_conditions text,
  status text NOT NULL DEFAULT 'open',
  students_on_bus integer,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select accident_reports" ON public.accident_reports FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can insert accident_reports" ON public.accident_reports FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can update accident_reports" ON public.accident_reports FOR UPDATE USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Admin can delete accident_reports" ON public.accident_reports FOR DELETE USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- Accident Report Documents
CREATE TABLE public.accident_report_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accident_report_id uuid NOT NULL REFERENCES public.accident_reports(id) ON DELETE CASCADE,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  file_name text NOT NULL,
  file_url text NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accident_report_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select accident_docs" ON public.accident_report_documents FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can insert accident_docs" ON public.accident_report_documents FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Admin can delete accident_docs" ON public.accident_report_documents FOR DELETE USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- Accident Notifications Log
CREATE TABLE public.accident_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accident_report_id uuid NOT NULL REFERENCES public.accident_reports(id) ON DELETE CASCADE,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by uuid,
  message text NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  channel text NOT NULL DEFAULT 'sms'
);

ALTER TABLE public.accident_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can select accident_notifications" ON public.accident_notifications FOR SELECT USING (district_id = get_demo_district_id() AND has_app_role('staff'));
CREATE POLICY "Staff can insert accident_notifications" ON public.accident_notifications FOR INSERT WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));

-- Storage bucket for accident documents
INSERT INTO storage.buckets (id, name, public) VALUES ('accident-documents', 'accident-documents', false);

CREATE POLICY "Staff can upload accident docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'accident-documents' AND has_app_role('staff'));
CREATE POLICY "Staff can view accident docs" ON storage.objects FOR SELECT USING (bucket_id = 'accident-documents' AND has_app_role('staff'));
CREATE POLICY "Admin can delete accident docs" ON storage.objects FOR DELETE USING (bucket_id = 'accident-documents' AND has_app_role('district_admin'));

-- Enable realtime for accident_reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.accident_reports;
