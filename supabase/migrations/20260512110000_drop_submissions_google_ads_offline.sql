-- Revert Google Ads offline conversion columns (see 20260512100000_submissions_google_ads_offline.sql)
ALTER TABLE public.submissions DROP COLUMN IF EXISTS gclid;
ALTER TABLE public.submissions DROP COLUMN IF EXISTS wbraid;
ALTER TABLE public.submissions DROP COLUMN IF EXISTS gbraid;
ALTER TABLE public.submissions DROP COLUMN IF EXISTS google_ads_conversion_uploaded_at;
