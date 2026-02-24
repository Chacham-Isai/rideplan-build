
-- Allow district staff to view residency documents for registrations in their district
CREATE POLICY "District staff can view residency documents"
  ON public.residency_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_registrations sr
      WHERE sr.id = residency_documents.registration_id
        AND sr.district_id = get_user_district_id()
    )
    AND has_app_role('staff')
  );

-- Allow district staff to view residency attestations for registrations in their district
CREATE POLICY "District staff can view residency attestations"
  ON public.residency_attestations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_registrations sr
      WHERE sr.id = residency_attestations.registration_id
        AND sr.district_id = get_user_district_id()
    )
    AND has_app_role('staff')
  );

-- Allow district staff to insert audit log entries for registrations in their district
CREATE POLICY "District staff can insert audit logs"
  ON public.residency_audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_registrations sr
      WHERE sr.id = residency_audit_log.registration_id
        AND sr.district_id = get_user_district_id()
    )
    AND has_app_role('staff')
  );

-- Allow district staff to view audit logs for registrations in their district
CREATE POLICY "District staff can view audit logs"
  ON public.residency_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_registrations sr
      WHERE sr.id = residency_audit_log.registration_id
        AND sr.district_id = get_user_district_id()
    )
    AND has_app_role('staff')
  );
