
-- Enums
CREATE TYPE public.contract_status AS ENUM ('active', 'expired', 'pending');
CREATE TYPE public.insurance_status AS ENUM ('active', 'expiring', 'expired');
CREATE TYPE public.invoice_status AS ENUM ('pending', 'approved', 'disputed');
CREATE TYPE public.bid_status AS ENUM ('draft', 'open', 'closed', 'awarded');
CREATE TYPE public.bid_response_status AS ENUM ('submitted', 'shortlisted', 'awarded', 'rejected');

-- Contracts
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  contract_start DATE NOT NULL,
  contract_end DATE NOT NULL,
  annual_value NUMERIC NOT NULL DEFAULT 0,
  routes_count INTEGER NOT NULL DEFAULT 0,
  rate_per_route NUMERIC,
  rate_per_mile NUMERIC,
  status contract_status NOT NULL DEFAULT 'pending',
  renewal_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select contracts" ON public.contracts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Contractor Insurance
CREATE TABLE public.contractor_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  provider TEXT NOT NULL,
  coverage_amount NUMERIC NOT NULL DEFAULT 0,
  additional_insured BOOLEAN DEFAULT false,
  expiration_date DATE NOT NULL,
  document_url TEXT,
  status insurance_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contractor_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select insurance" ON public.contractor_insurance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert insurance" ON public.contractor_insurance FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update insurance" ON public.contractor_insurance FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Contract Invoices
CREATE TABLE public.contract_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  invoiced_amount NUMERIC NOT NULL DEFAULT 0,
  verified_amount NUMERIC,
  discrepancy_amount NUMERIC,
  discrepancy_notes TEXT,
  gps_verified BOOLEAN DEFAULT false,
  status invoice_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contract_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select invoices" ON public.contract_invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert invoices" ON public.contract_invoices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update invoices" ON public.contract_invoices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Contractor Performance
CREATE TABLE public.contractor_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  on_time_pct NUMERIC DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  safety_incidents INTEGER DEFAULT 0,
  routes_completed INTEGER DEFAULT 0,
  routes_missed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contractor_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select performance" ON public.contractor_performance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert performance" ON public.contractor_performance FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update performance" ON public.contractor_performance FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bids
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  routes_spec TEXT,
  open_date DATE,
  close_date DATE,
  status bid_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select bids" ON public.bids FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bids" ON public.bids FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bids" ON public.bids FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bid Responses
CREATE TABLE public.bid_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
  contractor_name TEXT NOT NULL,
  proposed_rate NUMERIC NOT NULL DEFAULT 0,
  fleet_details TEXT,
  safety_record TEXT,
  total_score NUMERIC,
  status bid_response_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bid_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select bid responses" ON public.bid_responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert bid responses" ON public.bid_responses FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bid responses" ON public.bid_responses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
