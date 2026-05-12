-- Google Ads offline conversion: store click IDs on submission, dedupe uploads
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS gclid text,
  ADD COLUMN IF NOT EXISTS wbraid text,
  ADD COLUMN IF NOT EXISTS gbraid text,
  ADD COLUMN IF NOT EXISTS google_ads_conversion_uploaded_at timestamptz;
