
-- Task 1: Add district_id to bids, bid_responses, driver_reports
-- and update RLS policies to use district-scoped access

-- 1. Add district_id columns
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id);
ALTER TABLE public.bid_responses ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id);
ALTER TABLE public.driver_reports ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id);

-- 2. Backfill existing data with Lawrence district_id
UPDATE public.bids SET district_id = (SELECT id FROM public.districts WHERE slug = 'lawrence-ufsd' LIMIT 1) WHERE district_id IS NULL;
UPDATE public.bid_responses SET district_id = (SELECT id FROM public.districts WHERE slug = 'lawrence-ufsd' LIMIT 1) WHERE district_id IS NULL;
UPDATE public.driver_reports SET district_id = (SELECT id FROM public.districts WHERE slug = 'lawrence-ufsd' LIMIT 1) WHERE district_id IS NULL;

-- 3. Drop old RLS policies on bids and replace with district-scoped ones
DROP POLICY IF EXISTS "Admins can delete bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can insert bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can select bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can update bids" ON public.bids;

CREATE POLICY "District staff can select bids" ON public.bids FOR SELECT USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert bids" ON public.bids FOR INSERT WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update bids" ON public.bids FOR UPDATE USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District admin can delete bids" ON public.bids FOR DELETE USING (district_id = get_user_district_id() AND has_app_role('district_admin'));

-- 4. Drop old RLS policies on bid_responses and replace
DROP POLICY IF EXISTS "Admins can insert bid responses" ON public.bid_responses;
DROP POLICY IF EXISTS "Admins can select bid responses" ON public.bid_responses;
DROP POLICY IF EXISTS "Admins can update bid responses" ON public.bid_responses;

CREATE POLICY "District staff can select bid_responses" ON public.bid_responses FOR SELECT USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can insert bid_responses" ON public.bid_responses FOR INSERT WITH CHECK (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update bid_responses" ON public.bid_responses FOR UPDATE USING (district_id = get_user_district_id() AND has_app_role('staff'));

-- 5. Drop old RLS policies on driver_reports and replace
DROP POLICY IF EXISTS "Admins can update driver reports" ON public.driver_reports;
DROP POLICY IF EXISTS "Admins can view driver reports" ON public.driver_reports;
DROP POLICY IF EXISTS "Anyone can submit a driver report" ON public.driver_reports;

CREATE POLICY "Anyone can submit a driver report" ON public.driver_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "District staff can select driver_reports" ON public.driver_reports FOR SELECT USING (district_id = get_user_district_id() AND has_app_role('staff'));
CREATE POLICY "District staff can update driver_reports" ON public.driver_reports FOR UPDATE USING (district_id = get_user_district_id() AND has_app_role('staff'));
