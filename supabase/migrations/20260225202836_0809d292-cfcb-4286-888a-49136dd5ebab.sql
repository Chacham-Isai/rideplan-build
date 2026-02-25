
ALTER TABLE public.service_requests
  ADD COLUMN caller_name text,
  ADD COLUMN caller_phone text;
