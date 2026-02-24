
-- ============================================
-- Districts table (tenant table)
-- ============================================
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NY',
  beds_code TEXT,
  student_count INTEGER,
  address TEXT,
  city TEXT,
  zip TEXT,
  superintendent_name TEXT,
  superintendent_email TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  subscription_tier TEXT DEFAULT 'essentials' CHECK (subscription_tier IN ('essentials', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles table (extends auth.users, NO role column)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  title TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- District user roles (separate table for security)
-- ============================================
CREATE TABLE public.district_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.districts(id),
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'district_admin', 'transport_director', 'staff', 'parent', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, district_id)
);

ALTER TABLE public.district_user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_district_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.district_user_roles
  WHERE user_id = auth.uid()
    AND district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.has_app_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.get_user_role() = 'super_admin' THEN true
    WHEN required_role = 'district_admin' AND public.get_user_role() IN ('district_admin', 'super_admin') THEN true
    WHEN required_role = 'transport_director' AND public.get_user_role() IN ('transport_director', 'district_admin', 'super_admin') THEN true
    WHEN required_role = 'staff' AND public.get_user_role() IN ('staff', 'transport_director', 'district_admin', 'super_admin') THEN true
    WHEN required_role = 'parent' AND public.get_user_role() = 'parent' THEN true
    WHEN required_role = 'viewer' THEN true
    ELSE false
  END
$$;

-- ============================================
-- RLS Policies — districts
-- ============================================
CREATE POLICY "Users can view own district"
  ON public.districts FOR SELECT
  USING (id = public.get_user_district_id());

-- ============================================
-- RLS Policies — profiles
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "District admins can view district profiles"
  ON public.profiles FOR SELECT
  USING (district_id = public.get_user_district_id() AND public.has_app_role('district_admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- RLS Policies — district_user_roles
-- ============================================
CREATE POLICY "Users can view own role"
  ON public.district_user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "District admins can view district roles"
  ON public.district_user_roles FOR SELECT
  USING (district_id = public.get_user_district_id() AND public.has_app_role('district_admin'));

CREATE POLICY "District admins can insert district roles"
  ON public.district_user_roles FOR INSERT
  WITH CHECK (district_id = public.get_user_district_id() AND public.has_app_role('district_admin'));

CREATE POLICY "District admins can update district roles"
  ON public.district_user_roles FOR UPDATE
  USING (district_id = public.get_user_district_id() AND public.has_app_role('district_admin'));

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE TRIGGER update_districts_updated_at
  BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
