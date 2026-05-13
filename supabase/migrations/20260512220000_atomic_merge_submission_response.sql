CREATE OR REPLACE FUNCTION public.merge_submission_response(
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
  UPDATE submissions
  SET responses = coalesce(responses, '{}'::jsonb) || jsonb_build_object(p_key, p_value),
      last_updated = now()
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SubmissionID % not found', p_submission_id
      USING errcode = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_submission_response TO anon, authenticated, service_role;
