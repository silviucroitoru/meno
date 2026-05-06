-- Preserve an all-time completion-rate denominator by archiving incomplete submissions
-- before cleanup deletes them.
--
-- This migration:
-- - Creates `public.submissions_archive` (minimal, no PII)
-- - Updates `public.cleanup_incomplete_submissions()` to INSERT INTO archive then DELETE
-- - Updates `public.admin_metrics()` to compute total from submissions + archive

-- Minimal archive table. We intentionally do not store responses JSON / email here.
CREATE TABLE IF NOT EXISTS public.submissions_archive (
  submission_id integer PRIMARY KEY,
  created_at timestamptz,
  last_updated timestamptz,
  language text,
  had_email boolean NOT NULL DEFAULT false,
  archived_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions_archive ENABLE ROW LEVEL SECURITY;

-- No direct access; admin reads via SECURITY DEFINER functions only.

-- Update cleanup to archive rows before deletion.
CREATE OR REPLACE FUNCTION public.cleanup_incomplete_submissions(retention interval default interval '24 hours')
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  with to_delete as (
    select
      s.id,
      s.created_at,
      s.last_updated,
      s.language,
      (s.responses ? 'Email') as had_email
    from public.submissions s
    left join public.reports r on r.submission_id = s.id
    where r.submission_id is null
      and coalesce(s.last_updated, s.created_at) < now() - retention
      and (s.responses ? 'Email') is false
  ),
  archived as (
    insert into public.submissions_archive (submission_id, created_at, last_updated, language, had_email, archived_at)
    select id, created_at, last_updated, language, had_email, now()
    from to_delete
    on conflict (submission_id) do nothing
    returning submission_id
  )
  delete from public.submissions s
  using to_delete d
  where s.id = d.id;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Update admin_metrics to compute totals from submissions + archive.
CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $admin_metrics_body$
DECLARE
  v_total_submissions bigint;
  v_successful bigint;
  v_without_report bigint;
  v_completion_pct numeric;
  v_by_stage json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;

  -- All-time questionnaires started = still-present submissions + archived incompletes.
  SELECT
    (select count(*) from public.submissions) + (select count(*) from public.submissions_archive)
    INTO v_total_submissions;

  -- Successful = submissions that have a report row (reports are not archived/deleted by cleanup).
  SELECT count(*)
    INTO v_successful
    FROM public.submissions s
    WHERE EXISTS (
      SELECT 1
      FROM public.reports r
      WHERE r.submission_id = s.id
        AND r.menopause_report IS NOT NULL
    );

  v_without_report := greatest(v_total_submissions - v_successful, 0);

  IF v_total_submissions > 0 THEN
    v_completion_pct := round((v_successful::numeric / v_total_submissions::numeric) * 100, 1);
  ELSE
    v_completion_pct := 0;
  END IF;

  -- Stage breakdown (only successful reports), normalized to English.
  SELECT coalesce(json_object_agg(stage, cnt), '{}'::json)
    INTO v_by_stage
    FROM (
      SELECT
        public.normalize_menopause_stage(
          coalesce(nullif(trim(r.menopause_report #>> '{menopauseStage,stage}'), ''), 'Unknown')
        ) as stage,
        count(*)::bigint as cnt
      FROM public.reports r
      WHERE r.menopause_report IS NOT NULL
      GROUP BY 1
    ) s;

  RETURN json_build_object(
    'successfulSubmissions', v_successful,
    'totalSubmissions', v_total_submissions,
    'withoutReportCount', v_without_report,
    'completionRatePct', v_completion_pct,
    'byStage', v_by_stage
  );
END;
$admin_metrics_body$;

GRANT EXECUTE ON FUNCTION public.admin_metrics TO authenticated;

