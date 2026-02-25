
DROP POLICY IF EXISTS "Parents can insert own service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Parents can select own service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Parents can select notes on own requests" ON public.service_request_notes;

CREATE POLICY "Parents can insert own service_requests"
ON public.service_requests FOR INSERT TO authenticated
WITH CHECK (parent_user_id = auth.uid() AND has_app_role('parent'::text));

CREATE POLICY "Parents can select own service_requests"
ON public.service_requests FOR SELECT TO authenticated
USING (parent_user_id = auth.uid() AND has_app_role('parent'::text));

CREATE POLICY "Parents can select notes on own requests"
ON public.service_request_notes FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.service_requests sr WHERE sr.id = service_request_notes.request_id AND sr.parent_user_id = auth.uid())
  AND has_app_role('parent'::text)
);

CREATE OR REPLACE FUNCTION public.get_regional_benchmarks()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'district_count', (SELECT count(DISTINCT district_id) FROM contracts WHERE status = 'active'),
    'route_count', (SELECT count(*) FROM routes WHERE status = 'active'),
    'avg_rate_per_route', (SELECT round(avg(rate_per_route)::numeric, 2) FROM contracts WHERE status = 'active' AND rate_per_route IS NOT NULL),
    'avg_on_time_pct', (SELECT round(avg(on_time_pct)::numeric, 1) FROM routes WHERE status = 'active' AND on_time_pct IS NOT NULL),
    'avg_utilization', (SELECT round(avg(CASE WHEN capacity > 0 THEN (total_students::numeric / capacity) * 100 ELSE 0 END)::numeric, 1) FROM routes WHERE status = 'active' AND capacity > 0),
    'avg_cost_per_student', (SELECT round(avg(cost_per_student)::numeric, 2) FROM routes WHERE status = 'active' AND cost_per_student IS NOT NULL AND cost_per_student > 0)
  )
$$;
