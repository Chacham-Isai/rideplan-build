
-- Add slug column to districts for URL-based lookup
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_districts_slug ON public.districts (slug);

-- Allow public SELECT on districts by slug (for unauthenticated registration)
CREATE POLICY "Anyone can lookup district by slug"
  ON public.districts FOR SELECT
  USING (true);
