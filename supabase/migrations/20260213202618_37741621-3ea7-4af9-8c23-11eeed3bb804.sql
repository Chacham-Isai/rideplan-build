
-- Create table for audit request submissions
CREATE TABLE public.audit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  district TEXT NOT NULL,
  students TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form, no auth required)
CREATE POLICY "Anyone can submit an audit request"
  ON public.audit_requests
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated service role can read (no public reads)
-- No SELECT policy means anon users cannot read submissions
