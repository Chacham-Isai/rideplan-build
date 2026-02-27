
-- Drop the existing policies (may already exist from prior migration)
DROP POLICY IF EXISTS "Staff can upload own district accident docs" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view own district accident docs" ON storage.objects;

CREATE POLICY "Staff can upload own district accident docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'accident-documents'
    AND has_app_role('staff')
    AND (storage.foldername(name))[1] = get_demo_district_id()::text
  );

CREATE POLICY "Staff can view own district accident docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'accident-documents'
    AND has_app_role('staff')
    AND (storage.foldername(name))[1] = get_demo_district_id()::text
  );
