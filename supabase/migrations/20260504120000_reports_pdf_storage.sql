-- Public URL for PDFs (same pattern as typical public buckets)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS pdf_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('menopause-reports', 'menopause-reports', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read menopause PDFs" ON storage.objects;

CREATE POLICY "Public read menopause PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menopause-reports');
