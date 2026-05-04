-- Wipe user data only. Does NOT touch public.questionnaires.
--
-- 1) Postgres (submissions + reports via FK cascade, reset submission ids):
--      supabase db query --linked -f scripts/cleanup-user-data.sql
--
-- 2) Storage: direct SQL DELETE on storage.objects is blocked by Supabase.
--    Use CLI (recursive rm on bucket root may remove the bucket — recreate it):
--      supabase storage rm -r --linked --yes --experimental ss:///menopause-reports/
--    Then restore bucket + policy (same as migration 20260504120000_reports_pdf_storage.sql):
--      supabase db query --linked -c "
--      INSERT INTO storage.buckets (id, name, public)
--      VALUES ('menopause-reports', 'menopause-reports', true)
--      ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
--      DROP POLICY IF EXISTS \"Public read menopause PDFs\" ON storage.objects;
--      CREATE POLICY \"Public read menopause PDFs\" ON storage.objects FOR SELECT TO public
--      USING (bucket_id = 'menopause-reports');"

begin;

truncate table public.submissions restart identity cascade;

commit;
