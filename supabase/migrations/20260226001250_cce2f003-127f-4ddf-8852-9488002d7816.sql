-- Fix 1: breach_incidents - add district_id and fix RLS
ALTER TABLE public.breach_incidents ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id);

-- Backfill from contractor's district_id
UPDATE public.breach_incidents bi
SET district_id = c.district_id
FROM public.ed_law_2d_contractors c
WHERE bi.contractor_id = c.id AND bi.district_id IS NULL;

-- For any remaining rows without contractor, set a default (first district)
UPDATE public.breach_incidents
SET district_id = (SELECT id FROM public.districts LIMIT 1)
WHERE district_id IS NULL;

-- Make NOT NULL
ALTER TABLE public.breach_incidents ALTER COLUMN district_id SET NOT NULL;

-- Drop old policies
DROP POLICY IF EXISTS "Admins can select breaches" ON public.breach_incidents;
DROP POLICY IF EXISTS "Admins can insert breaches" ON public.breach_incidents;
DROP POLICY IF EXISTS "Admins can update breaches" ON public.breach_incidents;
DROP POLICY IF EXISTS "Admins can delete breaches" ON public.breach_incidents;

-- Create district-scoped RLS
CREATE POLICY "District staff can select breach_incidents"
  ON public.breach_incidents FOR SELECT
  USING (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can insert breach_incidents"
  ON public.breach_incidents FOR INSERT
  WITH CHECK (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "District staff can update breach_incidents"
  ON public.breach_incidents FOR UPDATE
  USING (district_id = get_demo_district_id() AND has_app_role('staff'));

CREATE POLICY "District admin can delete breach_incidents"
  ON public.breach_incidents FOR DELETE
  USING (district_id = get_demo_district_id() AND has_app_role('district_admin'));

-- Fix 2: demo_sessions - require super_admin role
DROP POLICY IF EXISTS "Super admin can select demo_sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Super admin can insert demo_sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Super admin can update demo_sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Super admin can delete demo_sessions" ON public.demo_sessions;

CREATE POLICY "Super admin can select demo_sessions"
  ON public.demo_sessions FOR SELECT
  USING (public.get_user_role() = 'super_admin' AND original_user_id = auth.uid());

CREATE POLICY "Super admin can insert demo_sessions"
  ON public.demo_sessions FOR INSERT
  WITH CHECK (public.get_user_role() = 'super_admin' AND original_user_id = auth.uid());

CREATE POLICY "Super admin can update demo_sessions"
  ON public.demo_sessions FOR UPDATE
  USING (public.get_user_role() = 'super_admin' AND original_user_id = auth.uid());

CREATE POLICY "Super admin can delete demo_sessions"
  ON public.demo_sessions FOR DELETE
  USING (public.get_user_role() = 'super_admin' AND original_user_id = auth.uid());

-- Fix 3: Storage - add district isolation to accident-documents
DROP POLICY IF EXISTS "Staff can upload accident docs" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view accident docs" ON storage.objects;

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
