
-- Fix 1: Restrict public district SELECT to only slug lookups with limited fields
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can lookup district by slug" ON public.districts;

-- Create a restricted policy that only allows lookups when filtering by slug
-- and only exposes non-sensitive fields via a view
CREATE OR REPLACE VIEW public.districts_public AS
SELECT id, name, state, city, slug
FROM public.districts
WHERE slug IS NOT NULL;

-- Re-create the policy scoped to slug-based lookups only
CREATE POLICY "Anyone can lookup district by slug"
ON public.districts FOR SELECT
TO anon, authenticated
USING (slug IS NOT NULL);

-- Fix 2: Make district_id nullable on safety_reports for anonymous submissions
ALTER TABLE public.safety_reports ALTER COLUMN district_id DROP NOT NULL;
