
-- Enum for audit actions
CREATE TYPE public.audit_action AS ENUM ('approved', 'denied', 'flagged', 'requested_info', 'unflagged');

-- Residency audit log table
CREATE TABLE public.residency_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.student_registrations(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL,
  action audit_action NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.residency_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.residency_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.residency_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also allow admins to delete registrations for completeness
CREATE POLICY "Admins can delete registrations"
  ON public.student_registrations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
