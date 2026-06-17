-- Contraception questionnaire: separate tables mirroring the menopause pattern.
-- Kept fully separate from menopause tables to avoid touching the existing flow.

-- Questionnaire definitions (keyed by language)
CREATE TABLE IF NOT EXISTS public.contraception_questionnaires (
  language TEXT PRIMARY KEY,
  questionnaire JSONB NOT NULL
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.contraception_submissions (
  id SERIAL PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'EN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ
);

ALTER TABLE public.contraception_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contraception_submissions ENABLE ROW LEVEL SECURITY;

-- No public policies: edge functions use the service role key and bypass RLS.
-- Admin reads happen through SECURITY DEFINER RPCs.

-- Atomic merge of a single response into the JSONB blob.
CREATE OR REPLACE FUNCTION public.merge_contraception_submission_response(
  p_submission_id bigint,
  p_key text,
  p_value jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE contraception_submissions
  SET responses = coalesce(responses, '{}'::jsonb) || jsonb_build_object(p_key, p_value),
      last_updated = now()
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SubmissionID % not found', p_submission_id
      USING errcode = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_contraception_submission_response TO anon, authenticated, service_role;
