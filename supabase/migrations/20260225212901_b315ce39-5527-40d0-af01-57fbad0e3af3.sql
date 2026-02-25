
-- Fix the SECURITY DEFINER view warning by making it SECURITY INVOKER
DROP VIEW IF EXISTS public.districts_public;
CREATE VIEW public.districts_public
WITH (security_invoker = true) AS
SELECT id, name, state, city, slug
FROM public.districts
WHERE slug IS NOT NULL;
