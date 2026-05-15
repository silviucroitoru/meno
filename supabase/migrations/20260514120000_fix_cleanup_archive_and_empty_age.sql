-- Fix cleanup_incomplete_submissions:
-- 1) Archive INSERT was in a WITH branch never referenced by the final DELETE, so PostgreSQL
--    could skip the INSERT entirely (empty submissions_archive while rows were deleted).
--    Use explicit INSERT ... SELECT then DELETE with the same predicates.
-- 2) Empty responses = '{}': age off created_at only so incidental last_updated bumps
--    (e.g. table UI) do not reset the retention clock.

CREATE OR REPLACE FUNCTION public.cleanup_incomplete_submissions(retention interval default interval '24 hours')
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  n_empty integer;
  n_archived_path integer;
BEGIN
  -- Hard-delete empty submissions (no archive — not counted in "started" metrics).
  DELETE FROM public.submissions
  WHERE responses = '{}'::jsonb
    AND created_at < now() - retention
    AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.submission_id = submissions.id);
  GET DIAGNOSTICS n_empty = ROW_COUNT;

  -- Archive minimal row, then delete started-but-incomplete (answers but no Email, no report).
  INSERT INTO public.submissions_archive (submission_id, created_at, last_updated, language, had_email, archived_at)
  SELECT
    s.id,
    s.created_at,
    s.last_updated,
    s.language,
    (s.responses ? 'Email') AS had_email,
    now()
  FROM public.submissions s
  LEFT JOIN public.reports r ON r.submission_id = s.id
  WHERE r.submission_id IS NULL
    AND coalesce(s.last_updated, s.created_at) < now() - retention
    AND (s.responses ? 'Email') IS FALSE
    AND s.responses <> '{}'::jsonb
  ON CONFLICT (submission_id) DO NOTHING;

  DELETE FROM public.submissions s
  WHERE NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.submission_id = s.id)
    AND coalesce(s.last_updated, s.created_at) < now() - retention
    AND (s.responses ? 'Email') IS FALSE
    AND s.responses <> '{}'::jsonb;

  GET DIAGNOSTICS n_archived_path = ROW_COUNT;
  RETURN n_empty + n_archived_path;
END;
$$;
